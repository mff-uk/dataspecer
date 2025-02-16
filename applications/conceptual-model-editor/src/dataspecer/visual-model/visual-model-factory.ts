import { createDefaultVisualModelFactory, VisualModel, WritableVisualModel } from "@dataspecer/core-v2/visual-model";

const visualModelFactory = createDefaultVisualModelFactory();

/**
 * @param source Optional model to load visual information from.
 * @returns Visual model with model information from given model.
 */
export function createWritableVisualModel(source: VisualModel | null): WritableVisualModel {
  const result = visualModelFactory.createNewWritableVisualModelSync();
  if (source !== null) {
    copyModelsData(source, result);
  }
  return result;
}

function copyModelsData(source: VisualModel, target: WritableVisualModel): void {
  for (const [identifier, data] of source.getModelsData()) {
    if (data.color === null) {
      continue;
    }
    target.setModelColor(identifier, data.color);
  }
}

export function createEmptyWritableVisualModel() {
  return visualModelFactory.createNewWritableVisualModelSync();
}
