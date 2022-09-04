import {StructureModel, StructureModelClass, StructureModelComplexType, StructureModelProperty} from "../structure-model/model";
import {OFN} from "../well-known";
import {QName} from "../xml/xml-conventions";
import {DataSpecificationArtefact, DataSpecificationSchema} from "../data-specification/model";
import {assertNot} from "../core";
import {ArtefactGeneratorContext} from "../generator";
import {pathRelative} from "../core/utilities/path-relative";
import {JSON_LD_GENERATOR} from "./json-ld-generator";
import {DefaultJsonConfiguration, JsonConfiguration, JsonConfigurator} from "../json/json-configuration";

// JSON-LD version
const VERSION = 1.1;

export class JsonLdAdapter {
  protected model: StructureModel;
  protected context: ArtefactGeneratorContext;
  protected artefact: DataSpecificationArtefact;
  protected configuration: JsonConfiguration;

  constructor(model: StructureModel, context: ArtefactGeneratorContext, artefact: DataSpecificationArtefact) {
    this.model = model;
    this.context = context;
    this.artefact = artefact;
    this.configuration = JsonConfigurator.merge(
        DefaultJsonConfiguration,
        JsonConfigurator.getFromObject(artefact.configuration)
    ) as JsonConfiguration;
  }

  public generate = async () => {
    const result = this.getContext();
    const context = result["@context"];

    if (this.model.roots.length > 1) {
      console.warn("JSON-LD generator: Multiple schema roots not supported.");
    }

    const rootClasses = this.model.roots[0].classes;
    // Iterate over all classes in root OR
    for (const root of rootClasses) {
      this.generateClassContext(root, context);
    }

    // Clean the object of undefined values
    return this.optimize(result);
  }

  protected generatePropertyContext(property: StructureModelProperty, context: object) {
    const contextData = {};

    const firstDataType = property.dataTypes[0];

    if (firstDataType.isAttribute()) {
      contextData["@id"] = property.cimIri;

      if (firstDataType.dataType === OFN.text) {
        contextData["@container"] = "@language";
      } else {
        const qName = simpleTypeMapQName[firstDataType.dataType];
        contextData["@type"] = qName ? `${qName[0]}:${qName[1]}` : (firstDataType.dataType ?? undefined);
      }
    }

    if (firstDataType.isAssociation()) {
      if (property.isReverse) {
        contextData["@reverse"] = property.cimIri;
      } else {
        contextData["@id"] = property.cimIri;
      }

      if (!firstDataType.dataType.isCodelist) {
        if (this.model.psmIri !== firstDataType.dataType.structureSchema) {
          if (property.cardinalityMax !== 1) {
            contextData["@container"] = "@set";
          }
          const artefact = findArtefactForImport(this.context, firstDataType.dataType);
          contextData["@context"] = pathRelative(this.artefact.publicUrl, artefact.publicUrl);
        } else {
          if (property.cardinalityMax === 1) {
            contextData["@type"] = "@id";
          } else {
            contextData["@container"] = "@set";
          }

          // Deal with OR
          if (property.dataTypes.length === 1) {
            // Check if the class is empty
            if (firstDataType.dataType.properties.length === 0) {
              contextData["@type"] = "@id";
            } else {
              const localContext = {}
              contextData["@context"] = localContext;
              this.generateClassContext(firstDataType.dataType, localContext);
            }
          } else {
            const localContext = [];
            for (const dataType of property.dataTypes) {
              const localContextForType = {};
              this.generateClassContext((dataType as StructureModelComplexType).dataType, localContextForType);
              localContext.push(localContextForType);
            }
            contextData["@context"] = localContext;
          }
        }
      }
    }

    context[property.technicalLabel] = contextData;
  }

  /**
   * Adds entry for a class to a given context.
   */
  protected generateClassContext(cls: StructureModelClass, context: object) {
    const innerContext = {};

    const data = {
      "@id": cls.cimIri,
      "@context": innerContext
    };

    for (const property of cls.properties) {
      this.generatePropertyContext(property, innerContext);
    }

    // Classes are identified by its type keyword

    //if (this.configuration.jsonTypeKeyMappingType === "json_type_key_mapping_type_label") {
    let label = cls.humanLabel[this.configuration.jsonTypeKeyMappingTypeLabel];
    if (!label) {
      console.warn(`JSON-LD Generator: There is no ${this.configuration.jsonTypeKeyMappingTypeLabel} label fof given entity.`, cls);
      label = cls.humanLabel[Object.keys(cls.humanLabel)[0]] ?? cls.psmIri;
    }
    context[label] = data;
    //}
  }

  protected getContext(): object {
    const context = {
      "@version": VERSION,
      //"rootcontainer": "@graph", // todo add support for root containers
    };

    if (this.configuration.jsonIdKeyAlias) {
      context[this.configuration.jsonIdKeyAlias] = "@id";
    }
    if (this.configuration.jsonTypeKeyAlias) {
      context[this.configuration.jsonTypeKeyAlias] = "@type";
    }

    return {
      "@context" : context,
    }
  }

  /**
   * Optimizes resulting context by removing unnecessary constructs such as
   * undefined or object with only @id keyword
   */
  protected optimize(obj: object): object {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
      if (Array.isArray(obj[key])) {
        newObj[key] = obj[key].map(v => this.optimize(v));
      } else if (obj[key] === Object(obj[key])) {
        newObj[key] = this.optimize(obj[key]);
        if (Object.keys(newObj[key]).length === 1 && newObj[key]["@id"]) {
          newObj[key] = newObj[key]["@id"];
        }
      } else if (obj[key] !== undefined) {
        newObj[key] = obj[key];
      }
    });
    return newObj;
  }
}

function findArtefactForImport(
  context: ArtefactGeneratorContext,
  modelClass: StructureModelClass
): DataSpecificationArtefact | null {
  const targetSpecification = context.specifications[modelClass.specification];
  assertNot(
    targetSpecification === undefined,
    `Missing specification ${modelClass.specification}`
  );
  for (const candidate of targetSpecification.artefacts) {
    if (candidate.generator !== JSON_LD_GENERATOR) {
      continue;
    }
    const candidateSchema = candidate as DataSpecificationSchema;
    if (modelClass.structureSchema !== candidateSchema.psm) {
      continue;
    }
    // TODO We should check that the class is root here.
    return candidate;
  }
  return null;
}

const simpleTypeMapQName: Record<string, QName> = {
  [OFN.boolean]: ["xsd", "boolean"],
  [OFN.date]: ["xsd", "date"],
  [OFN.time]: ["xsd", "time"],
  [OFN.dateTime]: ["xsd", "dateTimeStamp"],
  [OFN.integer]: ["xsd", "integer"],
  [OFN.decimal]: ["xsd", "decimal"],
  [OFN.url]: ["xsd", "anyURI"],
  [OFN.string]: ["xsd", "string"],
};
