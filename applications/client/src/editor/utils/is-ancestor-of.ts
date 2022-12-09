import {CoreResourceReader} from "@dataspecer/core/core";
import {PimClass} from "@dataspecer/core/pim/model";

/**
 * Checks whether the given resources are in ancestor - descendant relation.
 * @param reader
 * @param ancestor
 * @param descendant
 */
export async function isPimAncestorOf(
  reader: CoreResourceReader,
  ancestor: string,
  descendant: string,
): Promise<boolean> {
  const toVisit = [descendant];
  let index = 0;
  while (index < toVisit.length) {
    const currentIri = toVisit[index];
    const current = await reader.readResource(currentIri) as PimClass;

    if (current) {
      if (current.pimExtends.includes(ancestor)) {
        return true;
      }

      current.pimExtends.forEach(extended => toVisit.includes(extended) || toVisit.push(extended));
    }

    index++;
  }
  return false;
}
