import { RdfSource, RdfObject, RdfNode } from "../rdf-api.ts";

export class FederatedSource implements RdfSource {
  private readonly sources: RdfSource[];

  /**
   * If true try all sources, else stop after the first source return some
   * data. Works for properties and reverse properties.
   */
  private readonly exhaustive: boolean;

  protected constructor(sources: RdfSource[], exhaustive: boolean) {
    this.sources = sources;
    this.exhaustive = exhaustive;
  }

  static create(sources: RdfSource[]): RdfSource {
    return new FederatedSource(sources, false);
  }

  static createExhaustive(sources: RdfSource[]): RdfSource {
    return new FederatedSource(sources, true);
  }

  async property(iri: string, predicate: string): Promise<RdfObject[]> {
    const result = [];
    for (const source of this.sources) {
      addValues(result, await source.property(iri, predicate));
      if (!this.exhaustive && result.length > 0) {
        break;
      }
    }
    return Promise.resolve(result);
  }

  async reverseProperty(predicate: string, iri: string): Promise<RdfNode[]> {
    const result = [];
    for (const source of this.sources) {
      addValues(result, await source.reverseProperty(predicate, iri));
      if (!this.exhaustive && result.length > 0) {
        break;
      }
    }
    return Promise.resolve(result);
  }
}

function addValues<T>(values: T[], newValues: T[]) {
  // TODO Here we may consider to keep only unique values.
  values.push(...newValues);
}
