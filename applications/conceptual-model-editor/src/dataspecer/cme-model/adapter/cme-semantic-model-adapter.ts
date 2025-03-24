import { HexColor, VisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModel } from "../../semantic-model";
import { CmeSemanticModel, CmeSemanticModelType } from "../model";
import { LanguageString } from "../../entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";

export function semanticModelMapToCmeSemanticModel(
  models: Map<string, SemanticModel>,
  visualModel: VisualModel | null,
  defaultColor: HexColor,
  defaultLabel: (identifier: string) => string,
): CmeSemanticModel[] {
  const result: CmeSemanticModel[] = [];
  for (const value of models.values()) {
    result.push(semanticModelToCmeSemanticModel(
      value, visualModel, defaultColor, defaultLabel));
  }
  return result;
}

export function semanticModelToCmeSemanticModel(
  model: SemanticModel,
  visualModel: VisualModel | null,
  defaultColor: HexColor,
  defaultLabel: (identifier: string) => string,
): CmeSemanticModel {
  return {
    dsIdentifier: model.getId(),
    displayLabel: getModelLabel(model, defaultLabel),
    dsModelType: getModelType(model),
    displayColor: visualModel?.getModelColor(model.getId()) ?? defaultColor,
    baseIri: getModelBaseIri(model),
  }
}

const DEFAULT_MODEL_LABEL_LANGUAGE = "";

function getModelLabel(
  model: SemanticModel,
  defaultLabel: (identifier: string) => string,
): LanguageString {
  const alias = model.getAlias();
  if (alias !== null) {
    return { [DEFAULT_MODEL_LABEL_LANGUAGE]: alias };
  }
  return {
    [DEFAULT_MODEL_LABEL_LANGUAGE]: defaultLabel(model.getId()),
  };
}

function getModelType(model: SemanticModel): CmeSemanticModelType {
  if (model instanceof InMemorySemanticModel) {
    return CmeSemanticModelType.InMemorySemanticModel;
  } else if (model instanceof ExternalSemanticModel) {
    return CmeSemanticModelType.ExternalSemanticModel;
  } else {
    return CmeSemanticModelType.Default;
  }
}

function getModelBaseIri(model: SemanticModel): string | null {
  // We support anything with the "getBaseIri" method.
  if (typeof (model as any).getBaseIri === "function") {
    return (model as any).getBaseIri() as string;
  } else {
    return null;
  }
}
