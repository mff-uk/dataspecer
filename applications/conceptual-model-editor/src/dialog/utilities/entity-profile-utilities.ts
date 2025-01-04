import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { EntityState, EntityStateController, createEntityController } from "./entity-utilities";
import { EntityRepresentative, isRelativeIri } from "./dialog-utilities";
import { MissingModel, MissingProfile, NoWritableModelFound } from "../../application/error";
import { validationNoProblem } from "./validation-utilities";
import { CmeModel, filterWritableModels } from "../../dataspecer/cme-model";
import { ModelDsIdentifier } from "../../dataspecer/entity-model";

/**
 * Should be used instead of EntityState for profiles.
 */
export interface EntityProfileState extends EntityState {

  overrideName: boolean;

  overrideDescription: boolean;

  /**
   * List of entities that can be profiles.
   */
  availableProfiles: EntityRepresentative[];

  profileOf: EntityRepresentative;

  /**
   * Usage note.
   */
  usageNote: LanguageString;

  overrideUsageNote: boolean;

  /**
   * We can override profile only when we do profile a profile.
   */
  disableOverrideUsageNote: boolean;

}

export function createEntityProfileStateForNewEntityProfile(
  language: string,
  vocabularies: CmeModel[],
  profiles: EntityRepresentative[],
  profiledIdentifier: string,
): EntityProfileState {
  const writableVocabularies = filterWritableModels(vocabularies);
  if (writableVocabularies.length === 0) {
    throw new NoWritableModelFound();
  }
  const selectedVocabulary = writableVocabularies[0];

  const profileOf = profiles.find(item => item.identifier === profiledIdentifier) ?? null;
  if (profileOf === null) {
    throw new MissingProfile(profiledIdentifier);
  }

  return {
    language,
    allModels: vocabularies,
    availableModels: writableVocabularies,
    model: selectedVocabulary,
    iri: profileOf.iri ?? "",
    isIriAutogenerated: false,
    isIriRelative: isRelativeIri(profileOf.iri ?? ""),
    iriValidation: validationNoProblem(),
    name: profileOf.label,
    description: profileOf.description,
    overrideName: false,
    overrideDescription: false,
    availableProfiles: profiles,
    profileOf,
    usageNote: {},
    overrideUsageNote: true,
    disableOverrideUsageNote: true,
  };
}

export function createEntityProfileStateForNewProfileOfProfile(
  language: string,
  vocabularies: CmeModel[],
  profiles: EntityRepresentative[],
  profiledIdentifier: string,
): EntityProfileState {
  const result = createEntityProfileStateForNewEntityProfile(
    language, vocabularies, profiles, profiledIdentifier);
  // As we profile a profile, we can inherit the usage note.
  result.overrideUsageNote = false;
  result.disableOverrideUsageNote = false;
  return result;
}

/**
 * Load aggregated values from the profile representation.
 */
export function createEntityProfileStateForEdit(
  language: string,
  vocabularies: CmeModel[],
  vocabularyDsIdentifier: ModelDsIdentifier,
  profiles: EntityRepresentative[],
  profiledIdentifier: string,
  iri: string,
  name: LanguageString | null,
  description: LanguageString | null,
  usageNote: LanguageString | null,
): EntityProfileState {
  const writableVocabularies = filterWritableModels(vocabularies);
  const selectedVocabulary = writableVocabularies.find(item => item.dsIdentifier === vocabularyDsIdentifier);
  if (selectedVocabulary === undefined) {
    throw new MissingModel(vocabularyDsIdentifier);
  }

  const profileOf = profiles.find(item => item.identifier === profiledIdentifier) ?? null;
  if (profileOf === null) {
    throw new MissingProfile(profiledIdentifier);
  }

  return {
    language,
    allModels: vocabularies,
    availableModels: writableVocabularies,
    model: selectedVocabulary,
    iri,
    isIriAutogenerated: false,
    isIriRelative: isRelativeIri(iri),
    iriValidation: validationNoProblem(),
    name: name ?? profileOf.label,
    description: description ?? profileOf.description,
    overrideName: name !== null,
    overrideDescription: description !== null,
    availableProfiles: profiles,
    profileOf,
    usageNote: usageNote ?? profileOf.usageNote ?? {},
    overrideUsageNote: usageNote !== null,
    disableOverrideUsageNote: false,
  };
}

export interface EntityProfileStateController extends EntityStateController {

  toggleNameOverride: () => void;

  toggleDescriptionOverride: () => void;

  setProfileOf: (profileOf: EntityRepresentative) => void;

  setUsageNote: (setter: (value: LanguageString) => LanguageString) => void;

  toggleUsageNoteOverride: () => void;

}

// TODO PeSk Implement validation!
export function createEntityProfileController<State extends EntityProfileState>(
  changeState: (next: State | ((prevState: State) => State)) => void,
  generateIriFromName: (name: string) => string,
): EntityProfileStateController {

  // We use dummy IRI generator function as we do not generate IRI here.
  const entityController = createEntityController(changeState, generateIriFromName);

  const toggleNameOverride = () => {
    changeState((state) => ({ ...state, overrideName: !state.overrideName }));
  };

  const toggleDescriptionOverride = () => {
    changeState((state) => ({ ...state, overrideDescription: !state.overrideDescription }));
  };

  const setProfileOf = (profileOf: EntityRepresentative): void => {
    changeState((state) => ({
      ...state,
      profileOf,
      disableOverrideUsageNote: profileOf.profileOfIdentifiers.length === 0,
    }));
  };

  const setUsageNote = (setter: (value: LanguageString) => LanguageString): void => {
    changeState((state) => ({ ...state, usageNote: setter(state.usageNote) }));
  };

  const toggleUsageNoteOverride = () => {
    changeState((state) => ({ ...state, overrideUsageNote: !state.overrideUsageNote }));
  };

  return {
    ...entityController,
    toggleNameOverride,
    toggleDescriptionOverride,
    setProfileOf,
    setUsageNote,
    toggleUsageNoteOverride,
  };
}
