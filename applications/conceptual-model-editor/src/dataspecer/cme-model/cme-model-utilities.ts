import { CmeSemanticModel, CmeSemanticModelType } from "./model/cme-semantic-model";

export function filterWritableModels(
  items: CmeSemanticModel[],
): CmeSemanticModel[] {
  return items.filter(isModelWritable);
}

/**
 * @returns True if we can write the given vocabulary.
 */
function isModelWritable(item: CmeSemanticModel): boolean {
  return item.dsModelType === CmeSemanticModelType.InMemorySemanticModel;
}
