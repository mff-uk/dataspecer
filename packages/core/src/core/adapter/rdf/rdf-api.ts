export enum RdfTermType {
  BlankNode = "BlankNode",
  NamedNode = "NamedNode",
  Literal = "Literal",
  DefaultGraph = "DefaultGraph",
}

export interface RdfQuad {
  subject: RdfNode;

  predicate: RdfNode;

  object: RdfObject;

  graph: RdfNode;
}

export class RdfNode {
  static readonly DEFAULT_GRAPH = "";

  termType: string;

  value: string;

  static namedNode(iri: string): RdfNode {
    return {
      termType: RdfTermType.NamedNode,
      value: iri,
    };
  }

  static defaultGraph(): RdfNode {
    return {
      termType: RdfTermType.DefaultGraph,
      value: RdfNode.DEFAULT_GRAPH,
    };
  }
}

export class RdfObject extends RdfNode {
  datatype: RdfNode | null;

  language: string | null;

  static isNotNode(object: RdfObject): boolean {
    return !this.isNode(object);
  }

  static isNode(object: RdfObject): object is RdfObject {
    return (
      object.termType === RdfTermType.NamedNode ||
      object.termType === RdfTermType.BlankNode
    );
  }

  static isLiteral(object: RdfObject): boolean {
    return object.termType === RdfTermType.Literal;
  }
}

/**
 * This interface should be implemented by sources of RDF data.
 */
export interface RdfSource {
  property(iri: string, predicate: string): Promise<RdfObject[]> | RdfObject[];

  reverseProperty(predicate: string, iri: string): Promise<RdfNode[]> | RdfNode[];
}

/**
 * This interface should be implemented by RDF sinks, which can write
 * RDF data.
 */
export interface RdfSink {
  write(quads: RdfQuad): Promise<void>;
}
