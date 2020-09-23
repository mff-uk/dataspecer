//
// Define operations for reading properties of an RDF resource.
//

import {JsonLdEntity, Literal, JsonLdValue} from "./jsonld-types";

export function getId(entity: JsonLdEntity): string {
  return entity["@id"];
}

export function getTypes(entity: JsonLdEntity): string[] {
  const types = entity["@type"];
  if (Array.isArray(types)) {
    return types;
  } else {
    return [types];
  }
}

export function getResource(entity: JsonLdEntity, predicate: string)
  : string | undefined {
  //
  return getFirst(getResources(entity, predicate));
}

export function getResources(entity: JsonLdEntity, predicate: string)
  : string[] {
  return asArray(entity[predicate]).map(item => item["@id"]);
}

function getFirst<T>(values: T[]): T | undefined {
  if (values.length === 0) {
    return undefined;
  } else {
    return values[0];
  }
}

function asArray<T>(value: T | T[]): T[] {
  if (value === undefined || value === null) {
    return [];
  } else if (Array.isArray(value)) {
    return value;
  } else {
    return [value];
  }
}

export function getStrings(
  entity: any, predicate: string): Literal[] {
  return asArray(entity[predicate]).map(valueToString)
}

function valueToString(value: any): Literal {
  if (value["@value"] === undefined) {
    return {"": value};
  } else {
    if (value["@language"]) {
      return {[value["@language"]]: value["@value"]};
    } else {
      return {"": value["@value"]};
    }
  }
}

export function getValue(entity: any, predicate: string)
  : JsonLdValue | undefined {
  return getFirst(getValues(entity, predicate));
}

export function getValues(entity: any, predicate: string): JsonLdValue[] {
  return asArray(entity[predicate]).map((item) => {
    if (item["@value"] === undefined) {
      return item;
    } else {
      return item["@value"];
    }
  })
}

export function getDate(entity: any, predicate: string): Date | undefined {
  const value = getValue(entity, predicate);
  if (value === undefined || typeof value == "boolean") {
    return undefined;
  }
  return new Date(value);
}

export function getPlainStrings(entity: any, predicate: string): string[] {
  return asArray(entity[predicate]).map(valueToPlainString);
}

function valueToPlainString(value: any): string {
  if (value["@value"] === undefined) {
    return value;
  } else {
    return value["@value"];
  }
}

export function getPlainString(entity: any, predicate: string)
  : string | undefined {
  const strings = getPlainStrings(entity, predicate);
  if (strings.length == 0) {
    return undefined;
  }
  return strings[0];
}
