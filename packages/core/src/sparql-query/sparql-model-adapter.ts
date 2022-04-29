import {
  StructureModelClass,
  StructureModelPrimitiveType,
  StructureModelProperty,
  StructureModel,
  StructureModelType,
  StructureModelComplexType,
} from "../structure-model";
import {
  SparqlConstructQuery,
  SparqlElement,
  SparqlNode,
  SparqlOptionalPattern,
  SparqlPattern,
  SparqlQuery,
  SparqlTriple,
  SparqlUriNode,
  SparqlVariableNode,
} from "./sparql-model";

import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationSchema,
} from "../data-specification/model";

import { OFN, XSD } from "../well-known";
import { SPARQL } from "./sparql-vocabulary";

const rdfType: SparqlUriNode = {
  uri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
};

export function structureModelToSparql(
  specifications: { [iri: string]: DataSpecification },
  specification: DataSpecification,
  model: StructureModel
): SparqlQuery {
  const adapter = new SparqlAdapter(specifications, specification, model);
  return adapter.fromRoots(model.roots);
}

const anyUriType: StructureModelPrimitiveType = (function () {
  const type = new StructureModelPrimitiveType();
  type.dataType = XSD.anyURI;
  return type;
})();

type ClassMap = Record<string, StructureModelClass>;
class SparqlAdapter {
  private classMap: ClassMap;
  private specifications: { [iri: string]: DataSpecification };
  private specification: DataSpecification;
  private model: StructureModel;
  private variableCounter: number;

  constructor(
    specifications: { [iri: string]: DataSpecification },
    specification: DataSpecification,
    model: StructureModel
  ) {
    this.specifications = specifications;
    this.specification = specification;
    this.model = model;
    const map: ClassMap = {};
    for (const classData of Object.values(model.classes)) {
      map[classData.psmIri] = classData;
    }
    this.classMap = map;
    this.variableCounter = 0;
  }

  public fromRoots(roots: string[]): SparqlQuery {
    const rootClass = this.classMap[roots[0]];
    const rootSubject = this.newVariable();
    const elements = [];
    this.classToTriples(rootSubject, rootClass, true, elements);
    const pattern = {
      elements: elements
    } as SparqlPattern;
    return {
      prefixes: {},
      construct: pattern,
      where: pattern,
    } as SparqlConstructQuery;
  }

  getClass(iri: string): StructureModelClass {
    const cls = this.classMap[iri];
    if (cls == null) {
      throw new Error(`Class ${iri} is not defined in the model.`);
    }
    return cls;
  }

  newVariable(): SparqlVariableNode {
    return {
      variableName: `v${this.variableCounter++}`
    };
  }

  classToTriples(
    subject: SparqlNode,
    classData: StructureModelClass,
    includeType: boolean,
    elements: SparqlElement[]
  ) {
    if (includeType) {
      elements.push({
        subject: subject,
        predicate: rdfType,
        object: {
          uri: classData.cimIri
        } as SparqlUriNode
      } as SparqlTriple);
    }
    for (const property of classData.properties) {
      this.propertyToTriples(subject, property, elements);
    }
  }

  propertyToTriples(
    subject: SparqlNode,
    propertyData: StructureModelProperty,
    elements: SparqlElement[]
  ) {
    if (propertyData.cardinalityMin === 0) {
      const optionalElements = [];
      const optional: SparqlOptionalPattern = {
        optionalPattern: {
          elements: optionalElements
        }
      }
      elements.push(optional);
      elements = optionalElements;
    }

    const obj = this.newVariable();
    elements.push({
      subject: subject,
      predicate: {
        uri: propertyData.cimIri
      } as SparqlUriNode,
      object: obj
    } as SparqlTriple);
    for (const type of propertyData.dataTypes) {
      if (type.isAssociation()) {
        const classData = this.classMap[type.psmClassIri];
        this.classToTriples(obj, classData, false, elements);
      }
    }
  }
}
