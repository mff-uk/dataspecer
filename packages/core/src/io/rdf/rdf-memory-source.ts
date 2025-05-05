import { RdfSource, RdfQuad, RdfObject, RdfTermType, RdfNode } from "./rdf-api.ts";

/**
 * Can be used as a base class for sources that load chunk of data
 * into the memory.
 */
export class RdfMemorySource implements RdfSource {
  protected quads: RdfQuad[] = [];

  property(iri: string, predicate: string): RdfObject[] {
    return this.quads
      .filter((quad) => quad.subject.value === iri && quad.predicate.value === predicate)
      .map((quad) => quad.object);
  }

  reverseProperty(predicate: string, iri: string): RdfObject[] {
    return this.quads
      .filter((quad) => quad.object.value === iri)
      .filter((quad) => RdfObject.isNode(quad.object))
      .filter((quad) => quad.predicate.value === predicate)
      .map((quad) => quad.subject as RdfObject);
  }

  /**
   * Two blank nodes from two document might be the same after
   * the document is parsed, but they are not. A solution is to prefix
   * the blank nodes identifiers with URL.
   */
  protected static prefixBlankNodes(
    quads: RdfQuad[],
    prefix: string
  ): RdfQuad[] {
    // Insert URL into the blank node name.
    const sanitizeUrl = (url: string) =>
      url.startsWith("_:") ? url + ":" + prefix : url;

    // If value is blank node sanitize the value, else return the value.
    const sanitizeObject = <T extends RdfNode>(value: T) =>
      value.termType === RdfTermType.BlankNode
        ? {
            ...value,
            value: sanitizeUrl(value.value),
          }
        : value;

    return quads.map((quad) => ({
      subject: sanitizeObject(quad.subject),
      object: sanitizeObject(quad.object),
      predicate: quad.predicate,
      graph: sanitizeObject(quad.graph),
    }));
  }
}
