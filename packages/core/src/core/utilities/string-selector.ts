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

export function createStringSelector(
  preferredLanguages: string[],
) {
  return (value: LanguageString | null): string | null => {
    if (value === undefined || value === null) {
      return null;
    }
    for (const language of preferredLanguages) {
      if (value[language] !== undefined && value[language] !== null) {
        return value[language];
      }
    }
    // Return anything we found.
    const [result] = Object.values(value);
    return result ?? null;
  };
}