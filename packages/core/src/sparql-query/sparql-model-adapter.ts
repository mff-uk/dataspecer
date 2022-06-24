import {
  StructureModelClass,
  StructureModelProperty,
  StructureModel,
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
} from "../data-specification/model";

import { namespaceFromIri } from "../xml/xml-conventions";

export const RDF_TYPE_URI = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

const rdfType: SparqlUriNode = {
  uri: RDF_TYPE_URI
};

/**
 * Converts a {@link StructureModel} to a {@link SparqlQuery}.
 */
export function structureModelToSparql(
  specifications: { [iri: string]: DataSpecification },
  specification: DataSpecification,
  model: StructureModel
): SparqlQuery {
  const adapter = new SparqlAdapter(specifications, specification, model);
  return adapter.fromRoots(model.roots.flatMap(root => root.classes));
}

class SparqlAdapter {
  private variableCounter: number;
  
  private namespaces: Record<string, string>;
  private namespacesIris: Record<string, string>;
  private namespaceCounter: number;

  constructor(
    specifications: { [iri: string]: DataSpecification },
    specification: DataSpecification,
    model: StructureModel
  ) {
    this.variableCounter = 0;
    this.namespaces = {};
    this.namespacesIris = {};
    this.namespaceCounter = 0;
  }

  /**
   * Produces a SPARQL query from a list of root classes.
   */
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

  /**
   * Creates a new variable node with a unique name.
   */
  newVariable(): SparqlVariableNode {
    return {
      variableName: `v${this.variableCounter++}`
    };
  }

  /**
   * Creates a URI node and automatically shortens it using a prefix.
   */
  nodeFromIri(iri: string): SparqlNode {
    const parts = namespaceFromIri(iri);
    if (parts == null) {
      // Namespace cannot be extracted.
      return {
        uri: iri
      } as SparqlUriNode;
    }
    const [namespaceIri, localName] = parts;
    if (this.namespacesIris[namespaceIri] != null) {
      // The namespace was already registered; use its prefix.
      return {
        qname: [this.namespacesIris[namespaceIri], localName]
      } as SparqlQNameNode;
    }
    // Register a new namespace.
    const ns = "ns" + (this.namespaceCounter++);
    this.namespaces[ns] = namespaceIri;
    this.namespacesIris[namespaceIri] = ns;
    return {
      qname: [ns, localName]
    } as SparqlQNameNode;
  }

  /**
   * Adds pattern elements to {@link elements} matching a class.
   * @param subject The subject node for the instance of the class.
   * @param classData The class in the structure model.
   * @param optionalType Whether to wrap an rdf:match in OPTIONAL.
   * @param elements The output array to hold the pattern elements.
   */
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

  /**
   * Adds pattern elements to {@link elements} matching a property.
   * @param subject The subject node for the instance.
   * @param propertyData The property in the structure model.
   * @param elements The output array to hold the pattern elements.
   */
  propertyToTriples(
    subject: SparqlNode,
    propertyData: StructureModelProperty,
    elements: SparqlElement[]
  ) {
    if (propertyData.cardinalityMin === 0) {
      // Wrap the match in OPTIONAL if cardinality includes 0.
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

    // Add the triple for the property itself.
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

    // Produce the pattern for each class type of the property.
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

    // Add the union of patterns for each of the class.
    elements.push({
      unionPatterns: patterns
    } as SparqlUnionPattern);
  }
}
