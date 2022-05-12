import {
  StructureModelClass,
  StructureModelPrimitiveType,
  StructureModelProperty,
  StructureModel, StructureModelSchemaRoot,
} from "../structure-model/model/base";
import {
  SparqlConstructQuery,
  SparqlElement,
  SparqlNode,
  SparqlOptionalPattern,
  SparqlPattern,
  SparqlQNameNode,
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
import { namespaceFromIri } from "../xml/xml-conventions";
import { SPARQL } from "./sparql-vocabulary";

export const RDF_TYPE_URI = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

const rdfType: SparqlUriNode = {
  uri: RDF_TYPE_URI
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
  private specifications: { [iri: string]: DataSpecification };
  private specification: DataSpecification;
  private model: StructureModel;
  private variableCounter: number;
  
  private namespaces: Record<string, string>;
  private namespacesIris: Record<string, string>;
  private namespaceCounter: number;

  constructor(
    specifications: { [iri: string]: DataSpecification },
    specification: DataSpecification,
    model: StructureModel
  ) {
    this.specifications = specifications;
    this.specification = specification;
    this.model = model;
    this.variableCounter = 0;
    this.namespaces = {};
    this.namespacesIris = {};
    this.namespaceCounter = 0;
  }

  public fromRoots(roots: StructureModelSchemaRoot[]): SparqlQuery {
    const rootClass = roots[0].classes[0];
    const rootSubject = this.newVariable();
    const elements = [];
    this.classToTriples(rootSubject, rootClass, false, elements);
    const pattern = {
      elements: elements
    } as SparqlPattern;
    return {
      prefixes: this.namespaces,
      construct: pattern,
      where: pattern,
    } as SparqlConstructQuery;
  }

  newVariable(): SparqlVariableNode {
    return {
      variableName: `v${this.variableCounter++}`
    };
  }

  nodeFromIri(iri: string): SparqlNode {
    const parts = namespaceFromIri(iri);
    if (parts == null) {
      return {
        uri: iri
      } as SparqlUriNode;
    }
    const [namespaceIri, localName] = parts;
    if (this.namespacesIris[namespaceIri] != null) {
      return {
        qname: [this.namespacesIris[namespaceIri], localName]
      } as SparqlQNameNode;
    }
    const ns = "ns" + (this.namespaceCounter++);
    this.namespaces[ns] = namespaceIri;
    this.namespacesIris[namespaceIri] = ns;
    return {
      qname: [ns, localName]
    } as SparqlQNameNode;
  }

  classToTriples(
    subject: SparqlNode,
    classData: StructureModelClass,
    optionalType: boolean,
    elements: SparqlElement[]
  ) {
    const typeTriple: SparqlTriple = {
      subject: subject,
      predicate: rdfType,
      object: this.nodeFromIri(classData.cimIri)
    };
    if (optionalType) {
      elements.push({
        optionalPattern: {
          elements: [typeTriple]
        }
      } as SparqlOptionalPattern);
    } else {
      elements.push(typeTriple);
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
      predicate: this.nodeFromIri(propertyData.cimIri),
      object: obj
    } as SparqlTriple);
    for (const type of propertyData.dataTypes) {
      if (type.isAssociation()) {
        const classData = type.dataType;
        this.classToTriples(obj, classData, true, elements);
      }
    }
  }
}
