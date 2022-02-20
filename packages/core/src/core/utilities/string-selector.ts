import { LanguageString } from "../core-resource";

export type StringSelector = (string: LanguageString | null) => string | null;

export function defaultStringSelector(
  value: Record<string, string> | null
): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (value[""] !== undefined) {
    return value[""];
  }
  // Return anything we found.
  const [result] = Object.values(value);
  return result ?? null;
}
