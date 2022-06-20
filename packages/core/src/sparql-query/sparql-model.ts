import { QName } from "../xml/xml-conventions";

export class SparqlQuery {
  prefixes: Record<string, string>;
  where: SparqlPattern;
}

export class SparqlSelectQuery extends SparqlQuery {
  select: string[];
}

export class SparqlConstructQuery extends SparqlQuery {
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

export class SparqlPattern {
  elements: SparqlElement[];
}

export class SparqlElement {
  
}

export class SparqlTriple extends SparqlElement {
  subject: SparqlNode;
  predicate: SparqlNode;
  object: SparqlNode;
}

export class SparqlOptionalPattern extends SparqlElement {
  optionalPattern: SparqlPattern;
}

export class SparqlUnionPattern extends SparqlElement {
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

export abstract class SparqlNode {

}

export class SparqlUriNode {
  uri: string;
}

export class SparqlQNameNode {
  qname: QName;
}

export class SparqlVariableNode {
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
