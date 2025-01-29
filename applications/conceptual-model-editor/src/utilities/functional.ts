
/**
 * Removes item from given array and return modified array.
 * Return original array if the entity is not part of the array.
 */
export function removeFromArray<Type>(
  value: Type | null | undefined,
  array: Type[],
): Type[] {
  if (value === null || value === undefined) {
    return array;
  }
  const index = array.indexOf(value);
  if (index === -1) {
    return array;
  } else {
    return [
      ...array.slice(0, index),
      ...array.slice(index + 1),
    ];
  }
}

/**
 * Add item, using given identifier, to respective bucket.
 *
 * @example
 * const buckets : Record<string, any> = {}
 * addToMapArray("bucket", {}, buckets);
 */
export function addToMapArray<IdentifierType extends string, ValueType>(
  identifier: IdentifierType,
  value: ValueType,
  map: Record<IdentifierType, ValueType[]>,
): void {
  let array = map[identifier];
  if (array === undefined) {
    array = [];
    map[identifier] = array;
  }
  array.push(value);
}

export function replaceByIndexInArray<Type>(
  index: number,
  value: Type,
  array: Type[],
): Type[] {
  return [
    ...array.slice(0, index),
    value,
    ...array.slice(index + 1)
  ];
}

export function replaceInArray<Type>(
  previous: Type,
  next: Type,
  array: Type[],
): Type[] {
  const index = array.indexOf(previous);
  if (index === -1) {
    return array;
  }
  return replaceByIndexInArray(index, next, array);
}
