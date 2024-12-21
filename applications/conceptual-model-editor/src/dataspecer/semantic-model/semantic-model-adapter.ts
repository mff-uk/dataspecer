import { EntityModel } from "@dataspecer/core-v2";
import { LanguageString } from "@dataspecer/core/core/index";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";

import { CmeModelType, CmeModel } from "../cme-model";
import { t, configuration } from "../../application";


/**
 * We keep the translation function local so it can be change.
 */
let translate: (text: string, ...args: unknown[]) => string = t;

export function setTranslateFunction(nextTranslate: (text: string, ...args: unknown[]) => string) {
  translate = nextTranslate;
}

let defaultModelColor = configuration().defaultModelColor;

export function setDefaultModelColor(color: string) {
  defaultModelColor = color;
}

export function entityModelsMapToCmeVocabulary(models: Map<string, EntityModel>, visualModel: VisualModel | null): CmeModel[] {
  return [...models.values()].map(model => entityModelToCmeVocabulary(model, visualModel));
}

const DEFAULT_MODEL_LABEL_LANGUAGE = "";

export function entityModelToCmeVocabulary(model: EntityModel, visualModel: VisualModel | null): CmeModel {
  return {
    dsIdentifier: model.getId(),
    displayLabel: getModelLabel(model),
    dsModelType: getModelType(model),
    displayColor: visualModel?.getModelColor(model.getId()) ?? defaultModelColor,
    baseIri: getModelBaseIri(model),
  }
}

function getModelLabel(model: EntityModel): LanguageString {
  const alias = model.getAlias();
  if (alias !== null) {
    return { [DEFAULT_MODEL_LABEL_LANGUAGE]: alias };
  }
  return {
    [DEFAULT_MODEL_LABEL_LANGUAGE]:
      translate("model-service.model-label-from-id", model.getId()),
  };
}

function getModelType(model: EntityModel): CmeModelType {
  if (model instanceof InMemorySemanticModel) {
    return CmeModelType.InMemorySemanticModel;
  } else if (model instanceof ExternalSemanticModel) {
    return CmeModelType.ExternalSemanticModel;
  } else {
    return CmeModelType.Default;
  }
}

function getModelBaseIri(model: EntityModel): string | null {
  // We support anything with the "getBaseIri" method.
  if (typeof (model as any).getBaseIri === "function") {
    return (model as any).getBaseIri() as string;
  } else {
    return null;
  }
}
