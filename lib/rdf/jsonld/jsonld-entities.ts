//
// Functionality for working with multiple entities.
// Assumes flattened JSON-LD format with no keywords.
//

import {JsonLdEntity} from "./jsonld-types";
import {getId, getTypes} from "./jsonld-entity";

export type ObjectHandler = (object: JsonLdEntity) => void;

export function getEntityByIri(
  jsonld: JsonLdEntity[], iri: string): JsonLdEntity | undefined {
  for (let entity of jsonld) {
    if (getId(entity) === iri) {
      return entity;
    }
  }
  return undefined;
}

export function getEntityByType(
  jsonld: JsonLdEntity[], type: string): JsonLdEntity | undefined {
  for (let entity of jsonld) {
    if (!getTypes(entity).includes(type)) {
      continue;
    }
    return entity;
  }
}

export function getEntitiesByType(
  jsonld: JsonLdEntity[], type: string): JsonLdEntity[] {
  const result: JsonLdEntity[] = [];
  for (let entity of jsonld) {
    if (!getTypes(entity).includes(type)) {
      continue;
    }
    result.push(entity);
  }
  return result;
}

export function iterateEntitiesByType(
  jsonld: JsonLdEntity[], type: string, callback: ObjectHandler): void {
  for (let entity of jsonld) {
    if (!getTypes(entity).includes(type)) {
      continue;
    }
    callback(entity);
  }
}

export function iterateEntities(
  jsonld: JsonLdEntity[], callback: ObjectHandler): void {
  for (let entity of jsonld) {
    callback(entity);
  }
}
