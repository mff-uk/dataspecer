import {CoreResource} from "../../core-resource";
import {RdfSourceWrap} from "./rdf-source-wrap";

export enum RdfTermType {
  BlankNode = "BlankNode",
  NamedNode = "NamedNode",
  Literal = "Literal",
  DefaultGraph = "DefaultGraph"
}

export interface RdfQuad {
  subject: RdfNode;
  predicate: RdfNode;
  object: RdfObject;
  graph: RdfNode;
}

export class RdfNode {
  termType: string;
  value: string;

  static namedNode(iri: string) {
    return {
      "termType": RdfTermType.NamedNode,
      "value": iri,
    };
  }

}

export class RdfObject {
  termType: string;
  value: string;
  datatype?: RdfNode;
  language?: string;

  static isNotNode(object: RdfObject): boolean {
    return !this.isNode(object);
  }

  static isNode(object: RdfObject): boolean {
    return object.termType === RdfTermType.NamedNode
      || object.termType === RdfTermType.BlankNode;
  }

  static isLiteral(object: RdfObject): boolean {
    return object.termType === RdfTermType.Literal;
  }

}

export interface RdfSource {

  property(iri: string, predicate: string): Promise<RdfObject[]>;

  reverseProperty(predicate: string, iri: string): Promise<RdfObject[]>;

}

export interface RdfResourceAdapter {

  /**
   * Tries to load data into the given resource. If the resource is not of
   * expected type do nothing and return empty array.
   *
   * @param source Source of the data.
   * @param resource Resource to load data into.
   * @return IRRs of resources to load.
   */
  loadResource(
    source: RdfSourceWrap, resource: CoreResource
  ): Promise<string[]>;

}
