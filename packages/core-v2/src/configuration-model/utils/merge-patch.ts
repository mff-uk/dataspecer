/**
 * Performs a deep merge of the target object with the patch object.
 * If a property in the patch object is set to undefined, the property is removed from the target object.
 * Inspired by, but not compliant to https://tools.ietf.org/html/rfc7396
 */
export function mergePatch(target: any, patch: any): any {
  if (
    typeof target === "object" &&
    !Array.isArray(target) &&
    typeof patch === "object" &&
    !Array.isArray(patch)
  ) {
    const patched = { ...target };
    for (const key in patch) {
      if (patch[key] === undefined) {
        delete patched[key];
      } else {
        patched[key] = mergePatch(patched[key], patch[key]);
      }
    }
    return patched;
  } else {
    return patch;
  }
}