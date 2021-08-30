import {RdfSource, RdfQuad, RdfObject, RdfTermType} from "./rdf-api";

/**
 * Can be used as a base class for sources that load chunk of data
 * into the memory.
 */
export class RdfMemorySource implements RdfSource {

  protected quads: RdfQuad[] = [];

  protected RdfMemorySource() {

  }

  async property(iri: string, predicate: string): Promise<RdfObject[]> {
    const result = [];
    this.quads
      .filter(quad => quad.subject.value === iri)
      .filter(quad => quad.predicate.value === predicate)
      .forEach(quad => result.push(quad.object));
    return result;
  }

  async reverseProperty(
    predicate: string, iri: string,
  ): Promise<RdfObject[]> {
    const result = [];
    this.quads
      .filter(quad => quad.object.value === iri)
      .filter(quad => RdfObject.isNode(quad.object))
      .filter(quad => quad.predicate.value === predicate)
      .forEach(quad => result.push(quad.subject));
    return result;
  }

  /**
   * Two blank nodes from two document might be the same after
   * the document is parsed, but they are not. A solution is to prefix
   * the blank nodes identifiers with URL.
   */
  protected static prefixBlankNodes(
    quads: RdfQuad[], prefix:string
  ) : RdfQuad[] {

    // Insert URL into the blank node name.
    const sanitizeUrl = (url: string) =>
      url.startsWith("_:") ? url + ":" + prefix : url;

    // If value is blank node sanitize the value, else return the value.
    const sanitizeObject = <T> (value: T) =>
      value.termType === RdfTermType.BlankNode ? {
        ...value,
        "value": sanitizeUrl(value.value),
      } : value;

    return quads.map(quad => ({
      "subject": sanitizeObject(quad.subject),
      "object": sanitizeObject(quad.object),
      "predicate": quad.predicate,
      "graph": sanitizeObject(quad.graph),
    }));
  }

}
