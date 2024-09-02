import {CoreResourceReader} from "@dataspecer/core/core";
import {PimClass} from "@dataspecer/core/pim/model";
import { SemanticModelEntity } from "../../../../../packages/core-v2/lib/semantic-model/concepts/concepts";
import { isSemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";

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

export function isAncestorOf(
  model: SemanticModelEntity[],
  ancestor: string,
  descendant: string,
): boolean {
  const toVisit = [descendant];
  let index = 0;
  while (index < toVisit.length) {
    const currentId = toVisit[index];
    const current = model.find(e => e.id === currentId) as SemanticModelEntity;

    if (current) {
      const parents = model.filter(isSemanticModelGeneralization).filter(g => g.child === currentId).map(g => g.parent);
      if (parents.includes(ancestor)) {
        return true;
      }

      parents.forEach(extended => toVisit.includes(extended) || toVisit.push(extended));
    }

    index++;
  }
  return false;
}