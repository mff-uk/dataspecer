import { CmeModel } from "../../dataspecer/cme-model";
import { ClassesContextType } from "../../context/classes-context";
import { getRandomName } from "../../util/random-gen";
import { removeFromArray } from "../../utilities/functional";
import { sanitizeDuplicitiesInRepresentativeLabels } from "../../utilities/label";
import { EntityRepresentative, Specialization, representSpecializations, sortRepresentatives } from "./dialog-utilities";

export interface SpecializationState {

  /**
   * List of all available specializations.
   */
  availableSpecializations: EntityRepresentative[];

  /**
   * List of active specializations.
   */
  specializations: Specialization[];

}

export function createSpecializationStateForNew(
  language: string,
  models: CmeModel[],
  representatives: EntityRepresentative[],
) : SpecializationState {

  const specializations = sanitizeDuplicitiesInRepresentativeLabels(
    models, representatives);
  sortRepresentatives(language, specializations);

  return {
    availableSpecializations:  specializations,
    specializations: [],
  }
}

export function createSpecializationStateForEdit(
  language: string,
  classesContext: ClassesContextType,
  models: CmeModel[],
  representatives: EntityRepresentative[],
  entityIdentifier: string,
) : SpecializationState {

  const specializations = sanitizeDuplicitiesInRepresentativeLabels(
    models, representatives);
  sortRepresentatives(language, specializations);

  const selected = representSpecializations(entityIdentifier, classesContext.generalizations);

  return {
    availableSpecializations:  specializations,
    specializations: selected,
  }
}

export interface SpecializationStateController {

  addSpecialization: (specialized: string) => void;

  removeSpecialization: (value: Specialization) => void;

}

export function createSpecializationController<State extends SpecializationState>(
  changeState: (next: State | ((prevState: State) => State)) => void,
): SpecializationStateController {

  const addSpecialization = (specialized: string): void => {
    changeState((state) => ({
      ...state, specializations: [...state.specializations, {
        specialized,
        iri: getRandomName(10),
      }]
    }));
  };

  const removeSpecialization = (value: Specialization): void => {
    changeState((state) => ({
      ...state,
      specializations: removeFromArray(value, state.specializations),
    }));
  };

  return {
    addSpecialization,
    removeSpecialization,
  };
}
