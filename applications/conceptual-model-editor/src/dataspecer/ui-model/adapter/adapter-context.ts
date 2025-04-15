import { HexColor, VisualModel } from "@dataspecer/core-v2/visual-model";
import { CmeCardinality } from "../../cme-model";
import { EntityDsIdentifier, LanguageString, ModelDsIdentifier } from "../../entity-model";
import { languageStringToString } from "../../../utilities/string";
import { SemanticModel } from "../../semantic-model";

export interface UiAdapterContext {

  selectModelColor: (identifier: ModelDsIdentifier) => string;

  selectDisplayLabel: (entity: {
    identifier: EntityDsIdentifier,
    name: LanguageString | null,
  }) => string;

  selectLanguageString: (value: LanguageString | null) => string;

  /**
   * @param identifier
   * @returns Identifiers of all models with entity of given identifier.
   */
  selectModels: (identifier: string) => string[];

  cardinalityToLabel: (cardinality: CmeCardinality | null) => string | null;

}

export function createUiAdapterContext(
  language: string,
  languagePreferences: string[],
  visualModel: VisualModel | null,
  defaultModelColor: HexColor,
  models: SemanticModel[],
): UiAdapterContext {

  const selectModelColor = (identifier: ModelDsIdentifier): string => {
    return visualModel?.getModelColor(identifier) ?? defaultModelColor;
  };

  const selectDisplayLabel = (entity: {
    identifier: EntityDsIdentifier,
    name: LanguageString | null,
  }): string => {
    if (entity.name === null) {
      return entity.identifier;
    }
    return languageStringToString(languagePreferences, language, entity.name);
  }

  const selectLanguageString = (value: LanguageString | null): string => {
    if (value === null) {
      return "";
    }
    return languageStringToString(languagePreferences, language, value);
  };

  const selectModels = (identifier: string): string[] => {
    return models.filter(model => model.getEntities()[identifier] !== undefined)
      .map(model => model.getId());
  };

  const cardinalityToLabel = (cardinality: CmeCardinality | null): string | null => {
    if (cardinality === null || cardinality === undefined) {
      return null;
    }
    return `[${cardinality[0] ?? "*"}..${cardinality[1] ?? "*"}]`;
  };

  return {
    selectModelColor,
    selectDisplayLabel,
    selectLanguageString,
    selectModels,
    cardinalityToLabel,
  }
}
