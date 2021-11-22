import {LanguageString} from "../core-resource";

export type StringSelector = (string: LanguageString | null) => string;

export function defaultStringSelector(
  value: Record<string, string> | null,
): string {
  if (value === undefined || value === null) {
    return null;
  }
  if (value[""] !== undefined) {
    return value[""];
  }
  // Return anything we found.
  let [result] = Object.values(value);
  return result;
}
