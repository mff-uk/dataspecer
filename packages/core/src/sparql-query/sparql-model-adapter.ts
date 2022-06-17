import {
  StructureModelClass,
  StructureModelPrimitiveType,
  StructureModelProperty,
  StructureModel, StructureModelSchemaRoot,
} from "../structure-model/model";
import {
  SparqlConstructQuery,
  SparqlElement,
  SparqlNode,
  SparqlOptionalPattern,
  SparqlPattern,
  SparqlQNameNode,
  SparqlQuery,
  SparqlTriple,
  SparqlUnionPattern,
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
  return adapter.fromRoots(model.roots.flatMap(root => root.classes));
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

  public fromRoots(classes: StructureModelClass[]): SparqlQuery {
    const rootSubject = this.newVariable();
    const patterns: SparqlPattern[] = [];
    for (const cls of classes) {
      const elements = [];
      this.classToTriples(rootSubject, cls, false, elements);   
      patterns.push({
        elements: elements
      });
    }
    const union: SparqlUnionPattern = {
      unionPatterns: patterns
    }
    const pattern: SparqlPattern = {
      elements: [union]
    };
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
      const optionalElements: SparqlElement[] = [];
      const optional: SparqlOptionalPattern = {
        optionalPattern: {
          elements: optionalElements
        }
      }
      elements.push(optional);
      elements = optionalElements;
    }

    const obj = this.newVariable();
    const pred = this.nodeFromIri(propertyData.cimIri);

    if (propertyData.isReverse) {
      elements.push({
        subject: obj,
        predicate: pred,
        object: subject
      } as SparqlTriple);
    } else {
      elements.push({
        subject: subject,
        predicate: pred,
        object: obj
      } as SparqlTriple);
    }
    
    const optionalType = propertyData.dataTypes.length == 1;
    const patterns: SparqlPattern[] = [];

    for (const type of propertyData.dataTypes) {
      if (type.isAssociation()) {
        const classData = type.dataType;
        const patternElements: SparqlElement[] = [];
        this.classToTriples(obj, classData, optionalType, patternElements);
        patterns.push({
          elements: patternElements
        });
      }
    }

    elements.push({
      unionPatterns: patterns
    } as SparqlUnionPattern);
  }
}
