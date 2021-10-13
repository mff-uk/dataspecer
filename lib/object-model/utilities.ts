import {
  ObjectModelClass, ObjectModelProperty, LanguageString,
} from "./object-model";

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
  for (const anyValue of Object.values(value)) {
    return anyValue;
  }
  return null;
}

/**
 * Collect all properties for a given class and all it extends.
 */
export function collectClassPropertiesFromParents(
  modelClass: ObjectModelClass,
): ObjectModelProperty[] {
  const result = [];
  const queue = [modelClass];
  while (queue.length > 0) {
    const actualClass = queue.pop();
    queue.push(...actualClass.extends);
    result.push(...actualClass.properties);
  }
  return result;
}
