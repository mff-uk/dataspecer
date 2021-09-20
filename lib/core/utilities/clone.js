export function clone(object) {
  if (object === null) {
    return null;
  }
  if (typeof object == "function") {
    return object;
  }
  const result = Array.isArray(object) ? [] : {};
  for (const key in object) {
    const value = object[key];
    const type = {}.toString.call(value).slice(8, -1);
    if (type === "Array" || type === "Object") {
      result[key] = clone(value);
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