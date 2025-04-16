import { HexColor, VisualModel } from "@dataspecer/core-v2/visual-model";
import { EntityDsIdentifier, LanguageString, ModelDsIdentifier } from "../../entity-model";
import { languageStringToString } from "../../../utilities/string";
import { SemanticModel } from "../../semantic-model";

export type SelectSemanticModelColor =
  (identifier: ModelDsIdentifier) => HexColor;

export type SelectLanguageString =
  (value: LanguageString | null) => string;

export type SelectLabel = (
  name: LanguageString | null,
  iri: string | null,
  identifier: EntityDsIdentifier) => string;

export type SelectModelsWithEntity =
  (identifier: ModelDsIdentifier) => ModelDsIdentifier[];

export interface UiAdapterContext {

  selectSemanticModelColor: SelectSemanticModelColor;

  selectLanguageString: SelectLanguageString;

  selectLabel: SelectLabel;

  selectModelsWithEntity: SelectModelsWithEntity;

}

export function createUiAdapterContext(
  language: string,
  languagePreferences: string[],
  visualModel: VisualModel | null,
  defaultModelColor: HexColor,
  models: SemanticModel[],
): UiAdapterContext {

  const selectSemanticModelColor : SelectSemanticModelColor = (identifier) => {
    return visualModel?.getModelColor(identifier) ?? defaultModelColor;
  };

  const selectLanguageString: SelectLanguageString = (value)=> {
    if (value === null) {
      return "";
    }
    return languageStringToString(languagePreferences, language, value);
  };

  const selectLabel: SelectLabel = (name, iri, identifier) => {
    if (name === null) {
      return iri ?? identifier;
    }
    return languageStringToString(languagePreferences, language, name);
  }

  const selectModelsWithEntity: SelectModelsWithEntity = (identifier) => {
    return models.filter(model => model.getEntities()[identifier] !== undefined)
      .map(model => model.getId());
  };

  return {
    selectSemanticModelColor,
    selectLanguageString,
    selectLabel,
    selectModelsWithEntity,
  };
}
