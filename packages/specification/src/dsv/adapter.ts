import dsvContext from "./dsv-context.json" with { type: "json" };
import { knownPrefixes } from "./well-known.ts";

/**
 * Converts a DSV model to a JSON-LD serialization. Because the DSV model has a
 * primitive structure that tries to copy the final serialization, this function
 * only adds the JSON-LD context and fixes IRIs.
 */
export function dsvModelToJsonLdSerialization(model: object): object {
  model = structuredClone(model);
  model = prefixIris(model, knownPrefixes);
  (model as Record<string, unknown>)["@context"] = dsvContext["@context"];

  return model;
}

const SUFFIX_REGEX = /^[^\/#]{1,}$/;

function prefixIris<T>(data: T, prefixesMap: {[prefix: string]: string}): T {
  if (typeof data === "string") {
    for (const [prefix, prefixValue] of Object.entries(prefixesMap)) {
      if (data.startsWith(prefixValue) && SUFFIX_REGEX.test(data.substring(prefixValue.length))) {
        (data as string) = data.replace(prefixValue, `${prefix}:`);
        break;
      }
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => prefixIris(item, prefixesMap)) as T;
  }

  if (data === null || data === undefined) {
    return data;
  }

  for (const [key, value] of Object.entries(data) as [keyof T, unknown][]) {
    data[key] = prefixIris(data[key], prefixesMap);
  }
  return data;
}
