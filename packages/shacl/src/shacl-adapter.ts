import {
  StructureModel,
  StructureModelClass,
  StructureModelType,
  StructureModelComplexType,
  StructureModelProperty,
  StructureModelPrimitiveType,
} from "@dataspecer/core/structure-model/model";
import { ArtefactGeneratorContext } from "@dataspecer/core/generator";
import {
  DataSpecificationArtefact,
  DataSpecificationSchema,
} from "@dataspecer/core/data-specification/model";
import { OFN } from "@dataspecer/core/well-known";

// SHACL version REC-shacl-20170720 - doesn't have official version with major.minor.bugfix
/*
Implementation notes
-----
According to the list of validatable properties for SHACL:
NodeShape - generated

Shapes and Constraints
        2.1.2 Focus Nodes - focus nodes are generated as the root classes of the structure
        2.1.3 Targets
            2.1.3.1 Node targets (sh:targetNode) - not used, only for single subject focusing, not for this kind of general data validation
            2.1.3.2 Class-based Targets (sh:targetClass) - base implemented. TODO: need to incorporate prefix generation and iri shortening
            2.1.3.3 Implicit Class Targets - not used atm but COULD be used instead of sh:targetClass
            2.1.3.4 Subjects-of targets (sh:targetSubjectsOf) - not used atm: we know what the subject exactly is and we want to work with that
            2.1.3.5 Objects-of targets (sh:targetObjectsOf) - not used atm: we know what the subject is and we dont need relative finding
        2.1.4 Declaring the Severity of a Shape - all shapes are BY DEFAULT sh:Violation
        2.1.5 Declaring Messages for a Shape - no message generating atm
        2.1.6 Deactivating a Shape - all shapes implicitly ACTIVATED

PropertyShape - not generated separately atm, is included in NodeShape

Core Constraint Components

    4.1 Value Type Constraint Components
        4.1.1 sh:class - TODO The type of all value nodes. The values of sh:class in a shape are IRIs. Note that multiple values for sh:class are 
        interpreted as a conjunction, i.e. the values need to be SHACL instances of all of them. 
        4.1.2 sh:datatype TODO
        4.1.3 sh:nodeKind TODO
    4.2 Cardinality Constraint Components
        4.2.1 sh:minCount DONE
        4.2.2 sh:maxCount DONE
    4.3 Value Range Constraint Components -- TODO: Is this a thing in dataspecer?
        4.3.1 sh:minExclusive
        4.3.2 sh:minInclusive
        4.3.3 sh:maxExclusive
        4.3.4 sh:maxInclusive
    4.4 String-based Constraint Components -- TODO: Which of these are going to be a thing in dataspecer? I have seen only pattern
        4.4.1 sh:minLength
        4.4.2 sh:maxLength
        4.4.3 sh:pattern - TODO
        4.4.4 sh:languageIn
        4.4.5 sh:uniqueLang
    4.5 Property Pair Constraint Components -- TODO: Which of these are going to be a thing in dataspecer?
        4.5.1 sh:equals
        4.5.2 sh:disjoint
        4.5.3 sh:lessThan
        4.5.4 sh:lessThanOrEquals
    4.6 Logical Constraint Components -- TODO: Which of these are going to be a thing in dataspecer?
        4.6.1 sh:not
        4.6.2 sh:and
        4.6.3 sh:or
        4.6.4 sh:xone
    4.7 Shape-based Constraint Components -- TODO Think about if this is going to be used
        4.7.1 sh:node - This would be useful if there is possible to put nodes inside nodes in dataspecer
        4.7.2 sh:property
        4.7.3 sh:qualifiedValueShape, sh:qualifiedMinCount, sh:qualifiedMaxCount
    4.8 Other Constraint Components -- TODO: Which of these are going to be a thing in dataspecer?
        4.8.1 sh:closed, sh:ignoredProperties
        4.8.2 sh:hasValue
        4.8.3 sh:in


*/

const SHACL_PREFIX = "sh: <http://www.w3.org/ns/shacl#> .";
const RDFS_PREFIX = "rdfs: <http://www.w3.org/2000/01/rdf-schema#> .";

type QName = [prefix: string | null, localName: string];

export class ShaclAdapter {
  protected model: StructureModel;
  protected context: ArtefactGeneratorContext;
  protected artefact: DataSpecificationArtefact;

  constructor(
    model: StructureModel,
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact
  ) {
    this.model = model;
    this.context = context;
    this.artefact = artefact;
  }

  public generate = async () => {
    var result = this.getContext();

    //const result = this.getContext();
    //const context = result["@context"];

    if (this.model.roots.length > 1) {
      console.warn("SHACL generator: Multiple schema roots not supported.");
    }

    const rootClasses = this.model.roots[0].classes;
    // Iterate over all classes in root OR
    for (const root of rootClasses) {
      result = this.generateClassConstraints(root, result);
    }

    return { data: result };
  };

  generateClassConstraints(root: StructureModelClass, result: string): string {
    var newResult;
    newResult = result.concat("\n" + this.generateNodeShapeName(root));
    newResult = newResult.concat(this.generateNodeShapeHead(root));
    newResult = newResult.concat(this.generatePropertiesConstraints(root));
    //throw new Error("Method not implemented.");
    return newResult;
  }

  generateNodeShapeHead(root: StructureModelClass): string {
    var head;
    head = "\n\ta sh:NodeShape ;";
    head =
      root.pimIri != null
        ? head.concat(`\n\tsh:targetClass <${root.pimIri}> ;`)
        : "";
    for (const languageTag in root.humanLabel) {
      const language = root.humanLabel[languageTag];
      head =
        root.humanLabel != null
          ? head.concat(`\n\trdfs:label \"${language}\"@${languageTag} ;`)
          : "";
    }
    for (const languageTag in root.humanDescription) {
      const language = root.humanDescription[languageTag];
      head =
        root.humanDescription != null
          ? head.concat(`\n\trdfs:comment \"${language}\"@${languageTag} ;`)
          : "";
    }
    //head = (root.pimIri != null) ? head.concat(`\n\trdfs:seeAlso <${ root.pimIri }> ;`) : "";
    return head;
  }

  /**
   * The function takes available description (technical or human label) and makes it camel case.
   * @param root
   * @returns Camel case name for the shape.
   */
  generateNodeShapeName(root: StructureModelClass): string {
    var capitalizedTechnicalLabel = "";

    if (root.technicalLabel != null) {
      capitalizedTechnicalLabel =
        root.technicalLabel.charAt(0).toUpperCase() +
        root.technicalLabel.slice(1);
    } else {
      // TODO generate name other way if technicalLabel is missing
      for (const languageTag in root.humanLabel) {
        const language = root.humanLabel[languageTag];
        capitalizedTechnicalLabel =
          language.charAt(0).toUpperCase() + language.slice(1);
      }
    }

    return capitalizedTechnicalLabel + "Shape";
  }

  generatePropertiesConstraints(root: StructureModelClass): string {
    var propDesc = "";
    if (root.properties != null && root.properties.length != 0) {
      for (const [i, prop] of root.properties.entries()) {
        const cardinalitymin = prop.cardinalityMin;
        const cardinalitymax = prop.cardinalityMax;
        const technicallabel = prop.technicalLabel;
        const cimiri = prop.cimIri;
        const pimiri = prop.pimIri;
        const psmiri = prop.psmIri;
        const humanLabel = prop.humanLabel;
        const humandesc = prop.humanDescription;
        const datatypes = prop.dataTypes;
        const demat = prop.dematerialize;
        const isreverse = prop.isReverse;
        const pathtoorigin = prop.pathToOrigin;

        propDesc = propDesc.concat(`\n\tsh:property [`);
        propDesc = propDesc.concat(`\n\t\tsh:path ${cimiri};`);
        propDesc = propDesc.concat(`\n\t\tsh:minCount ${cardinalitymin} ;`);
        propDesc = propDesc.concat(`\n\t\tsh:maxCount ${cardinalitymax} ;`);
        propDesc = propDesc.concat(`\n\t\ttechnicallabel ${technicallabel} ;`);
        propDesc = propDesc.concat(`\n\t\tcimiri ${cimiri} ;`);
        propDesc = propDesc.concat(`\n\t\tpimiri ${pimiri} ;`);
        propDesc = propDesc.concat(`\n\t\tpsmiri ${psmiri} ;`);
        for (const languageTag in humanLabel) {
          const language = humanLabel[languageTag];
          propDesc = propDesc.concat(
            `\n\t\tsh:name "${language}"@${languageTag} ;`
          );
        }
        for (const languageTag in humandesc) {
          const language = humandesc[languageTag];
          propDesc = propDesc.concat(
            `\n\t\tsh:description "${language}"@${languageTag} ;`
          );
        }
        // TODO How to go through datatypes????
        for (var dt in datatypes.entries) {
          //propDesc = propDesc.concat(`\n\t\tsh:datatype "${ dt. }"@${ languageTag } ;`);
        }
        propDesc = propDesc.concat(`\n\t\tsh:datatype ${datatypes} ;`);
        propDesc = propDesc.concat(`\n\t\tdemat ${demat} ;`);
        propDesc = propDesc.concat(`\n\t\tisreverse ${isreverse} ;`);
        propDesc = propDesc.concat(`\n\t\tpathtoorigin ${pathtoorigin} ;`);
        propDesc = propDesc.concat(`\n\t]`);
        // Check if the property is the last one in the properties list
        if (i === root.properties.length - 1) {
          propDesc.concat(" .");
        } else {
          propDesc.concat(" ;");
        }
      }
    }

    return propDesc;
  }

  protected getContext(): string {
    const data = `@prefix ${SHACL_PREFIX}`.concat(`\n@prefix ${RDFS_PREFIX}\n`);
    // TODO Add prefixes used in the graph
    // TODO Add info about the whole structure...name, comment, description,...

    return data;
  }
}

// Types for specification in sh:datatype
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
