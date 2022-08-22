import {StructureModel, StructureModelClass, StructureModelProperty} from "../structure-model/model";
import {OFN} from "../well-known";
import {QName} from "../xml/xml-conventions";
import {DataSpecificationArtefact, DataSpecificationSchema} from "../data-specification/model";
import {assertNot} from "../core";
import {ArtefactGeneratorContext} from "../generator";
import {pathRelative} from "../core/utilities/path-relative";
import {JSON_LD_GENERATOR} from "./json-ld-generator";

// JSON-LD version
const VERSION = 1.1;

export class JsonLdAdapter {
  protected model: StructureModel;
  protected context: ArtefactGeneratorContext;
  private artefact: DataSpecificationArtefact;

  constructor(model: StructureModel, context: ArtefactGeneratorContext, artefact: DataSpecificationArtefact) {
    this.model = model;
    this.context = context;
    this.artefact = artefact;
  }

  public generate = async () => {
    const result = this.getContext();
    const context = result["@context"];

    const rootClass = this.model.roots[0].classes[0];
    this.generateClassContext(rootClass, context);

    // Clean the object of undefined values
    return removeEmpty(result);
  }

  /**
   * Adds entry for a property to a given context
   */
  private generatePropertyContext(property: StructureModelProperty, context: object) {
    const data = {};

    const dataType = property.dataTypes[0];

    if (dataType.isAttribute()) {
      data["@id"] = property.cimIri;

      if (dataType.dataType === OFN.text) {
        data["@container"] = "@language";
      } else {
        const qName = simpleTypeMapQName[dataType.dataType];
        data["@type"] = qName ? `${qName[0]}:${qName[1]}` : dataType.dataType;
      }
    }

    if (dataType.isAssociation()) {
      if (property.isReverse) {
        data["@reverse"] = property.cimIri;
      } else {
        data["@id"] = property.cimIri;
      }

      if (!dataType.dataType.isCodelist) {
        if (this.model.psmIri !== dataType.dataType.structureSchema) {
          if (property.cardinalityMax !== 1) {
            data["@container"] = "@set";
          }
          const artefact = findArtefactForImport(this.context, dataType.dataType);
          data["@context"] = pathRelative(this.artefact.publicUrl, artefact.publicUrl);
        } else {
          if (property.cardinalityMax === 1) {
            data["@type"] = "@id";
          } else {
            data["@container"] = "@set";
          }

          const localContext = {
            "@version": VERSION,
          }
          data["@context"] = localContext;
          this.generateClassContext(dataType.dataType, localContext);
        }
      }
    }

    context[property.technicalLabel] = data;
  }

  /**
   * Adds entry for a class to a given context
   */
  private generateClassContext(cls: StructureModelClass, context: object) {
    const innerContext = {
      "@version": VERSION,
    };

    const data = {
      "@id": cls.cimIri,
      "@context": innerContext
    };

    for (const property of cls.properties) {
      this.generatePropertyContext(property, innerContext);
    }

    context[cls.technicalLabel ?? "class"] = data;
  }

  private getContext(): object {
    const context = {
      "@version": VERSION,
      "$rootcontainer$": "@graph",
      "$type$": "@type",
      "$id$": "@id",
    };

    return {
      "@context" : context,
    }
  }
}

const removeEmpty = (obj) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] === Object(obj[key])) newObj[key] = removeEmpty(obj[key]);
    else if (obj[key] !== undefined) newObj[key] = obj[key];
  });
  return newObj;
};

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
