import { EntityModel } from "@dataspecer/core-v2";
import { entityModelsMapToCmeVocabulary } from "../dataspecer/semantic-model/semantic-model-adapter";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { CmeModel, CmeModelType } from "../dataspecer/cme-model";

export function findAnyWritableModelFromRawInput(models: Map<string, EntityModel>, visualModel: VisualModel | null): CmeModel | null {
  const cmeModels = entityModelsMapToCmeVocabulary(models, visualModel);
  const writableSemanticModel = findAnyWritableModel(cmeModels);
  return writableSemanticModel;
}

export function findAnyWritableModel(items: CmeModel[]): CmeModel | null {
  return items.find(isModelWritable) ?? null;
}

export function filterWritableModels(items: CmeModel[]): CmeModel[] {
  return items.filter(isModelWritable);
}

/**
 * @param item
 * @returns True if we can write the given vocabulary.
 */
function isModelWritable(item: CmeModel): boolean {
  return item.dsModelType === CmeModelType.InMemorySemanticModel;
}
