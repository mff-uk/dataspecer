import { QName } from "@dataspecer/xml/conventions";

/**
 * A SPARQL query.
 */
export class SparqlQuery {
  /**
   * The namespace prefixes used by the query.
   */
  prefixes: Record<string, string>;

  /**
   * The WHERE portion of the query.
   */
  where: SparqlPattern;
}

/**
 * A SELECT SPARQL query.
 */
export class SparqlSelectQuery extends SparqlQuery {
  /**
   * The array of variables returned by the query.
   */
  select: string[];
}

/**
 * A CONSTRUCT SPARQL query.
 */
export class SparqlConstructQuery extends SparqlQuery {
  /**
   * The CONSTRUCT pattern.
   */
  construct: SparqlPattern;
}

export function sparqlQueryIsSelect(
  query: SparqlQuery
): query is SparqlSelectQuery {
  return (query as SparqlSelectQuery).select !== undefined;
}

export function sparqlQueryIsConstruct(
  query: SparqlQuery
): query is SparqlConstructQuery {
  return (query as SparqlConstructQuery).construct !== undefined;
}

/**
 * Represents a graph pattern.
 */
export class SparqlPattern {
  /**
   * The array of elements inside the pattern.
   */
  elements: SparqlElement[];
}

/**
 * Represents an element inside a graph pattern.
 */
export class SparqlElement {
  
}

/**
 * Represents a triple match in a pattern.
 */
export class SparqlTriple extends SparqlElement {
  /**
   * The subject node of the triple.
   */
  subject: SparqlNode;

  /**
   * The predicate node of the triple.
   */
  predicate: SparqlNode;

  /**
   * The object node of the triple.
   */
  object: SparqlNode;
}

/**
 * Represents an OPTIONAL pattern.
 */
export class SparqlOptionalPattern extends SparqlElement {
  /**
   * The nested optional pattern.
   */
  optionalPattern: SparqlPattern;
}

/**
 * Represents a UNION pattern.
 */
export class SparqlUnionPattern extends SparqlElement {
  /**
   * The patterns of which the union is formed.
   */
  unionPatterns: SparqlPattern[];
}

export function sparqlElementIsTriple(
  element: SparqlElement
): element is SparqlTriple {
  return (element as SparqlTriple).subject !== undefined;
}

export function sparqlElementIsOptional(
  element: SparqlElement
): element is SparqlOptionalPattern {
  return (element as SparqlOptionalPattern).optionalPattern !== undefined;
}

export function sparqlElementIsUnion(
  element: SparqlElement
): element is SparqlUnionPattern {
  return (element as SparqlUnionPattern).unionPatterns !== undefined;
}

/**
 * Represents an RDF node in SPARQL.
 */
export abstract class SparqlNode {

}

/**
 * Represents a URI node.
 */
export class SparqlUriNode {
  /**
   * The URI value of the node.
   */
  uri: string;
}

/**
 * Represents a URI node using a namespace prefix.
 */
export class SparqlQNameNode {
  /**
   * The {@link QName} value of the node.
   */
  qname: QName;
}

/**
 * Represents a variable node.
 */
export class SparqlVariableNode {
  /**
   * The name of the variable.
   */
  variableName: string;
}

export function sparqlNodeIsUri(
  node: SparqlNode
): node is SparqlUriNode {
  return (node as SparqlUriNode).uri !== undefined;
}

export function sparqlNodeIsQName(
  node: SparqlNode
): node is SparqlQNameNode {
  return (node as SparqlQNameNode).qname !== undefined;
}

export function sparqlNodeIsVariable(
  node: SparqlNode
): node is SparqlVariableNode {
  return (node as SparqlVariableNode).variableName !== undefined;
}
