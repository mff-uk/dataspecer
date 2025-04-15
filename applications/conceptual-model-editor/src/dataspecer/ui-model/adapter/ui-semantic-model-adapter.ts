import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";

import { SemanticModel } from "../../semantic-model";
import { UiModelType, UiSemanticModel } from "../model";
import { UiAdapterContext } from "./adapter-context";

export function semanticModelMapToCmeSemanticModel(
  context: UiAdapterContext,
  semanticModels: SemanticModel[],
): UiSemanticModel[] {
  return semanticModels.map(model => semanticModelToCmeSemanticModel(context, model));
}

export function semanticModelToCmeSemanticModel(
  context: UiAdapterContext,
  model: SemanticModel,
): UiSemanticModel {
  const identifier = model.getId();
  const displayLabel = model.getAlias() ?? identifier;
  const displayColor = context.selectModelColor(identifier);
  if (model instanceof InMemorySemanticModel) {
    return {
      identifier,
      modelType: UiModelType.InMemorySemanticModel,
      displayLabel,
      displayColor,
    }
  } else if (model instanceof ExternalSemanticModel) {
    return {
      identifier,
      modelType: UiModelType.ExternalSemanticModel,
      displayLabel,
      displayColor,
    }
  } else {
    return {
      identifier,
      modelType: UiModelType.DefaultSemanticModel,
      displayLabel,
      displayColor,
    }
  }
}
