import { Entity } from "@dataspecer/core-v2";
import { isSemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";

export function isAncestorOf(
  model: Entity[],
  ancestor: string,
  descendant: string,
): boolean {
  const toVisit = [descendant];
  let index = 0;
  while (index < toVisit.length) {
    const currentId = toVisit[index];
    const current = model.find(e => e.id === currentId) as Entity;

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