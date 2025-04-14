// @ts-nocheck
export function clone<T>(object: T, hash = new WeakMap()): T {
  // Do not try to clone primitives or functions
  if (Object(object) !== object || object instanceof Function) return object;
  if (hash.has(object)) return hash.get(object); // Cyclic reference
  const result = Array.isArray(object) ? [] : Object.create(Object.getPrototypeOf(object));
  hash.set(object, result);
  for (const key in object) {
    const value = object[key];
    const type = {}.toString.call(value).slice(8, -1);
    if (type === "Array" || type === "Object") {
      result[key] = clone(value, hash);
    } else if (type === "Date") {
      result[key] = new Date(value.getTime());
    } else if (type === "RegExp") {
      throw Error("Can't clone RegExp.");
    } else {
      result[key] = value;
    }
  }
  return result;
}
