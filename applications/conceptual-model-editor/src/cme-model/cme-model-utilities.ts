import { EntityModel } from "@dataspecer/core-v2";
import { semanticModelMapToCmeSemanticModel } from "../dataspecer/cme-model/adapter";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { CmeSemanticModel, CmeSemanticModelType } from "../dataspecer/cme-model";
import { configuration, t } from "../application";

export function findAnyWritableModelFromRawInput(
  models: Map<string, EntityModel>,
  visualModel: VisualModel | null,
): CmeSemanticModel | null {
  const cmeModels = semanticModelMapToCmeSemanticModel(
    models, visualModel,
    configuration().defaultModelColor,
    identifier => t("model-service.model-label-from-id", identifier));
  const writableSemanticModel = findAnyWritableModel(cmeModels);
  return writableSemanticModel;
}

export function findAnyWritableModel(items: CmeSemanticModel[]): CmeSemanticModel | null {
  return items.find(isModelWritable) ?? null;
}

export function filterWritableModels(items: CmeSemanticModel[]): CmeSemanticModel[] {
  return items.filter(isModelWritable);
}

/**
 * @param item
 * @returns True if we can write the given vocabulary.
 */
function isModelWritable(item: CmeSemanticModel): boolean {
  return item.dsModelType === CmeSemanticModelType.InMemorySemanticModel;
}
