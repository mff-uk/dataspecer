import { CmeModelType, CmeModel } from "./cme-model";

export function filterWritableModels(items: CmeModel[]): CmeModel [] {
  return items.filter(isModelWritable);
}

/**
 * @param item
 * @returns True if we can write the given vocabulary.
 */
function isModelWritable(item: CmeModel) : boolean {
  return item.dsModelType === CmeModelType.InMemorySemanticModel;
}
