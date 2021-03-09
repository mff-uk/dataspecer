import {RdfBaseValue, RdfBlankNode, RdfEntity, RdfNamedNode} from "../rdf-api";
import {StatementSource} from "./statements-api";

export class FederatedSource implements StatementSource {

  private readonly sources: StatementSource [];

  /**
   * If true try all sources, else stop after the first source return some
   * data. Works for properties and reverse properties.
   */
  private readonly exhaustive: boolean;

  protected constructor(sources: StatementSource[], exhaustive:boolean) {
    this.sources = sources;
    this.exhaustive = exhaustive;
  }

  static create(sources: StatementSource[]): StatementSource {
    return new FederatedSource(sources, false);
  }

  static createExhaustive(sources: StatementSource[]): StatementSource {
    return new FederatedSource(sources, true);
  }

  async properties(
    entity: RdfEntity, predicate: string,
  ): Promise<RdfBaseValue[]> {
    const result: RdfBaseValue[] = [];
    for (const source of this.sources) {
      addValues(result, await source.properties(entity, predicate));
      if (!this.exhaustive && result.length > 0) {
        break;
      }
    }
    return Promise.resolve(result);
  }

  async reverseProperties(
    predicate: string, entity: RdfEntity,
  ): Promise<RdfBaseValue[]> {
    const result: (RdfBlankNode | RdfNamedNode)[] = [];
    for (const source of this.sources) {
      addValues(result, await source.reverseProperties(predicate, entity));
      if (!this.exhaustive && result.length > 0) {
        break;
      }
    }
    return Promise.resolve(result);
  }

}

function addValues(values: RdfBaseValue[], newValues: RdfBaseValue[]) {
  // TODO Keep only unique.
  values.push(...newValues);
}
