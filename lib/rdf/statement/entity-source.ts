//
// Utility classes to make working with RdfSource easier in some cases.
//

import {
  RdfBaseValue,
  RdfBlankNode,
  RdfEntity,
  RdfLiteral,
  RdfNamedNode,
  StatementSource
} from "./statement-api";

const TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

const HAS_FIRST = "http://www.w3.org/1999/02/22-rdf-syntax-ns#first";

const HAS_REST = "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest";

const RDF_NIL = "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil";

export type ExtendedRdfEntityList = { entity: RdfEntity, order?: number }[];

/**
 * Wrap source and entity to provide simple access to source functions.
 */
export class EntitySource {

  private readonly rdfEntity: RdfEntity;

  private readonly rdfSource: StatementSource;

  protected constructor(entity: RdfEntity, source: StatementSource) {
    this.rdfEntity = entity;
    this.rdfSource = source;
  }

  static forIri(iri: string, source: StatementSource) {
    return EntitySource.forEntity(RdfEntity.create(iri), source);
  }

  static forEntity(entity: RdfEntity, source: StatementSource) {
    return new EntitySource(entity, source);
  }

  id(): string {
    return this.rdfEntity.id;
  }

  async properties(predicate: string): Promise<RdfBaseValue[]> {
    return this.rdfSource.properties(this.rdfEntity, predicate);
  }

  async literal(predicate: string): Promise<RdfLiteral | undefined> {
    const properties = await this.properties(predicate);
    if (properties.length == 0) {
      return undefined;
    }
    const result: RdfBaseValue = properties[0];
    if (result.isLiteral()) {
      return result as RdfLiteral;
    } else {
      return undefined;
    }
  }

  async literals(predicate: string): Promise<RdfLiteral[]> {
    const properties = await this.properties(predicate);
    return properties
      .filter(item => item.isLiteral())
      .map(item => item as RdfLiteral);
  }

  async entity(predicate: string): Promise<RdfEntity | undefined> {
    const properties = await this.properties(predicate);
    for (const property of properties) {
      if (property.isBlankNode() || property.isNamedNode()) {
        return RdfEntity.create(property.id);
      }
    }
    return undefined;
  }

  async entities(predicate: string): Promise<RdfEntity[]> {
    const properties = await this.properties(predicate);
    const result = [];
    for (const property of properties) {
      if (property.isNamedNode() || property.isBlankNode()) {
        result.push(RdfEntity.create(property.id));
      }
    }
    return result;
  }

  /**
   * Resolve lists with rdf:first, rdf:rest
   */
  async entitiesExtended(predicate: string): Promise<ExtendedRdfEntityList> {
    const properties = await this.properties(predicate);
    const result: ExtendedRdfEntityList = [];
    for (const property of properties) {
      if (property.isNamedNode() || property.isBlankNode()) {
        const hasFirst = await this.rdfSource.properties(
          RdfEntity.create(property.id), HAS_FIRST);
        if (hasFirst.length === 0) {
          // It is an entity.
          result.push({"entity": RdfEntity.create(property.id)});
        } else {
          // It is a list.
          await this.loadList(result, 0, property);
        }
      }
    }
    return result;
  }

  async loadList(
    collector: ExtendedRdfEntityList, order: number,
    node: RdfBlankNode | RdfNamedNode
  ) {
    const entity = RdfEntity.create(node.id);
    const hasFirst = await this.rdfSource.properties(entity, HAS_FIRST);
    if (hasFirst.length !== 1) {
      throw new Error(`Invalid number rdf:head for ${node.id}`);
    }
    const first = hasFirst[0];
    if (first.isNamedNode() || first.isBlankNode()) {
      collector.push({"entity": RdfEntity.create(first.id), "order": order});
    }
    const hasRest = await this.rdfSource.properties(entity, HAS_REST);
    if (hasRest.length !== 1) {
      throw new Error(`Invalid number rdf:rest for ${node.id}`);
    }
    const rest = hasRest[0];
    if (rest.isNamedNode() || rest.isBlankNode()) {
      if (rest.id === RDF_NIL) {
        return;
      }
      await this.loadList(collector, order + 1, rest);
    }
  }

  async types(): Promise<string[]> {
    const properties = await this.properties(TYPE);
    return properties
      .filter(property => property.isNamedNode)
      .map(property => (property as RdfNamedNode).id);
  }

}


