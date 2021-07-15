import {RdfSource, RdfQuad, RdfObject} from "./rdf-api";

/**
 * Abstract implementation of in-memory source.
 */
export abstract class RdfMemorySource implements RdfSource {

  protected quads: RdfQuad[] = [];

  async property(iri: string, predicate: string): Promise<RdfObject[]> {
    const result = [];
    this.quads
      .filter(quad => quad.subject.value === iri)
      .filter(quad => quad.predicate.value === predicate)
      .forEach(quad => result.push(quad.object));
    return result;
  }

  async reverseProperty(
    predicate: string, iri: string
  ): Promise<RdfObject[]> {
    const result = [];
    this.quads
      .filter(quad => quad.object.value === iri)
      .filter(quad => quad.object.isNode())
      .filter(quad => quad.predicate.value === predicate)
      .forEach(quad => result.push(quad.object));
    return result;
  }

}
