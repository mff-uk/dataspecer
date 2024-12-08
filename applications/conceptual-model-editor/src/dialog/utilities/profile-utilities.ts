import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { EntityRepresentative } from "./dialog-utilities";

/**
 * Shared interface profile dialogs.
 */
export interface ProfileState {

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

export interface ProfileStateController {

  setProfileOf: (profileOf: EntityRepresentative) => void;

  setUsageNote: (setter: (value: LanguageString) => LanguageString) => void;

  toggleUsageNoteOverride: () => void;

}

/**
 * Create controller for profile state.
 * Does not utilize any form of memoization.
 */
export function createProfileController<State extends ProfileState>(
  changeState: (next: State | ((prevState: State) => State)) => void,
): ProfileStateController {

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
    setProfileOf,
    setUsageNote,
    toggleUsageNoteOverride,
  }
}
