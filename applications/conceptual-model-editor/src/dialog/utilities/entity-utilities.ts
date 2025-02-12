import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";

import { generateName } from "../../util/name-utils";
import { getAvailableLanguagesForLanguageString } from "../../util/language-utils";
import { MissingModel, NoWritableModelFound } from "../../application/error";
import { ValidationState, isValid, validationError, validationNoProblem } from "./validation-utilities";
import { CmeModel, filterWritableModels } from "../../dataspecer/cme-model";
import { ModelDsIdentifier } from "../../dataspecer/entity-model";
import { isRelativeIri } from "../../utilities/iri";

export interface EntityState {

  language: string;

  /**
   * List of all models, used for reference.
   */
  allModels: CmeModel[];

  /**
   * List of all writable models which can be selected to own the entity.
   */
  availableModels: CmeModel[];

  /**
   * Entity owner.
   */
  model: CmeModel;

  /**
   * When true the dialog do not allow for change of model.
   */
  disableModelChange: boolean;

  iri: string;

  /**
   * If true, change in name result in generation of IRI.
   */
  isIriAutogenerated: boolean;

  /**
   * If true the IRI is relative with respect to model.
   */
  isIriRelative: boolean;

  /**
   * Validation message for IRI.
   */
  iriValidation: ValidationState;

  /**
   * Entity name.
   */
  name: LanguageString;

  /**
   * Entity description.
   */
  description: LanguageString;

}

/**
 * Create state for new entity in the default model.
 * @throws
 */
export function createEntityStateForNew(
  language: string,
  defaultModelIdentifier: string | null,
  vocabularies: CmeModel[],
  generateIriFromName: (name: string) => string,
): EntityState {
  const writableVocabularies = filterWritableModels(vocabularies);
  if (writableVocabularies.length === 0) {
    throw new NoWritableModelFound();
  }
  const selectedVocabulary =
    writableVocabularies.find(item => item.dsIdentifier === defaultModelIdentifier)
    ?? writableVocabularies[0];

  const name = generateName();

  return {
    language,
    allModels: vocabularies,
    availableModels: writableVocabularies,
    model: selectedVocabulary,
    disableModelChange: false,
    iri: generateIriFromName(name),
    isIriAutogenerated: true,
    isIriRelative: true,
    iriValidation: validationNoProblem(),
    name: { [language]: name },
    description: {},
  };
}

/**
 * Create state for existing entity that exists in given model.
 * Change of model is not allowed.
 * @throws
 */
export function createEntityStateForEdit(
  language: string,
  vocabularies: CmeModel[],
  vocabularyDsIdentifier: ModelDsIdentifier,
  iri: string,
  name: LanguageString,
  description: LanguageString,
): EntityState {
  const writableVocabularies = filterWritableModels(vocabularies);
  const selectedVocabulary = writableVocabularies.find(item => item.dsIdentifier === vocabularyDsIdentifier);
  if (selectedVocabulary === undefined) {
    throw new MissingModel(vocabularyDsIdentifier);
  }

  return {
    language,
    allModels: vocabularies,
    // We allow only the model the entity is already in.
    availableModels: [selectedVocabulary],
    model: selectedVocabulary,
    disableModelChange: true,
    iri,
    isIriAutogenerated: false,
    isIriRelative: isRelativeIri(iri),
    iriValidation: validationNoProblem(),
    name,
    description,
  };
}

export interface EntityStateController {

  /**
   * Change model the entity should belong to.
   */
  setModel: (model: CmeModel) => void;

  /**
   * Set entity IRI, the meaning is not specified on this level.
   */
  setIri: (iri: string) => void;

  /**
   * Switch between relative and absolute IRI.
   */
  setIsIriRelative: (value: boolean) => void;

  /**
   * Set entity name.
   */
  setName: (setter: (value: LanguageString) => LanguageString) => void;

  /**
   * Set entity description.
   */
  setDescription: (setter: (value: LanguageString) => LanguageString) => void;

}

export function createEntityController<State extends EntityState>(
  changeState: (next: State | ((prevState: State) => State)) => void,
  generateIriFromName: (name: string) => string,
): EntityStateController {

  const setModel = (model: CmeModel) => {
    changeState((state) => {
      return {
        ...state,
        model: model,
      };
    });
  };

  const setIri = (iri: string) => {
    changeState((state) => validateEntityState({ ...state, iri, isIriAutogenerated: false }));
  };

  const setIsIriRelative = (value: boolean) => {
    // We also need to change value of the IRI.
    changeState(state => {
      let iri;
      if (value) {
        // We change from absolute to relative.
        iri = state.iri.replace(state.model.baseIri ?? "", "");
      } else {
        // We change form relative to absolute.
        iri = (state.model.baseIri ?? "") + state.iri;
      }
      return validateEntityState({
        ...state,
        iri,
        isIriRelative: value,
      });
    });
  };

  const setName = (setter: (value: LanguageString) => LanguageString): void => {
    changeState(state => {
      const name = setter(state.name);
      if (!state.isIriAutogenerated) {
        return { ...state, name };
      }
      //
      const languages = getAvailableLanguagesForLanguageString(name);
      if (languages.length === 0) {
        return state;
      }
      return validateEntityState({
        ...state,
        name,
        iri: generateIriFromName(name[languages[0]] ?? ""),
      });
    });
  };

  const setDescription = (setter: (value: LanguageString) => LanguageString): void => {
    changeState((state) => ({ ...state, description: setter(state.description) }));
  };

  return {
    setModel,
    setIri,
    setIsIriRelative,
    setName,
    setDescription,
  };
}

export function validateEntityState<State extends EntityState>(state: State): State {
  const iriValidation = state.iri.trim() !== "" ?
    validationNoProblem() : validationError("iri-must-not-be-empty");

  return {
    ...state,
    iriValidation,
  };
}

export function isEntityStateValid(state: EntityState): boolean {
  return isValid(state.iriValidation);
}
