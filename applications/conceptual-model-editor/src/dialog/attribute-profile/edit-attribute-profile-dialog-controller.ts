import { useMemo } from "react";

import { configuration } from "../../application";
import { DialogProps } from "../dialog-api";
import { createCreateEntityController, createEntityController, CreateEntityState, CreateEntityStateController, EntityState, EntityStateController } from "../utilities/entity-utilities";
import { createProfileController, ProfileState, ProfileStateController } from "../utilities/profile-utilities";
import { Cardinality, DataTypeRepresentative, EntityRepresentative } from "../utilities/dialog-utilities";
import { validationNoProblem, ValidationState, validationWarning } from "../utilities/validation-utilities";

export interface CreateAttributeProfileDialogState extends EntityState, CreateEntityState, ProfileState {

  language: string;

  overrideName: boolean;

  overrideDescription: boolean;

  /**
   * Domain.
   */
  domain: EntityRepresentative;

  initialDomain: EntityRepresentative;

  overrideDomain: boolean;

  domainValidation: ValidationState;

  /**
   * Domain cardinality.
   */
  domainCardinality: Cardinality;

  initialDomainCardinality: Cardinality;

  overrideDomainCardinality: boolean;

  domainCardinalityValidation: ValidationState;

  /**
   * Available domain items.
   */
  availableDomainItems: EntityRepresentative[];

  /**
   * Range.
   */
  range: DataTypeRepresentative;

  initialRange: DataTypeRepresentative;

  overrideRange: boolean;

  rangeValidation: ValidationState;

  /**
   * Range cardinality.
   */
  rangeCardinality: Cardinality;

  initialRangeCardinality: Cardinality;

  overrideRangeCardinality: boolean;

  rangeCardinalityValidation: ValidationState;

  /**
   * Available range items.
   */
  availableRangeItems: DataTypeRepresentative[];

  availableCardinalities: Cardinality[];

}

export interface CreateAttributeProfileDialogController extends EntityStateController, CreateEntityStateController, ProfileStateController {

  toggleNameOverride: () => void;

  toggleDescriptionOverride: () => void;

  setDomain: (value: EntityRepresentative) => void;

  toggleDomainOverride: () => void;

  setDomainCardinality: (value: Cardinality) => void;

  toggleDomainCardinalityOverride: () => void;

  setRange: (value: DataTypeRepresentative) => void;

  toggleRangeOverride: () => void;

  setRangeCardinality: (value: Cardinality) => void;

  toggleRangeCardinalityOverride: () => void;

}

export function useCreateAttributeProfileDialogController({ changeState }: DialogProps<CreateAttributeProfileDialogState>): CreateAttributeProfileDialogController {

  return useMemo(() => {

    const entityController = createEntityController(changeState);

    const newEntityController = createCreateEntityController(
      changeState, entityController, configuration().nameToClassIri);

    const profileController = createProfileController(changeState);

    const toggleNameOverride = () => {
      changeState((state) => ({ ...state, overrideName: !state.overrideName }));
    };

    const toggleDescriptionOverride = () => {
      changeState((state) => ({ ...state, overrideDescription: !state.overrideDescription }));
    };

    const setDomain = (value: EntityRepresentative) => {
      changeState((state) => validate({ ...state, domain: value }));
    };

    const toggleDomainOverride = () => {
      changeState((state) => validate({ ...state, overrideDomain: !state.overrideDomain }));
    };

    const setDomainCardinality = (value: Cardinality) => {
      changeState((state) => validate({ ...state, domainCardinality: value }));
    };

    const toggleDomainCardinalityOverride = () => {
      changeState((state) => validate({ ...state, overrideDomainCardinality: !state.overrideDomainCardinality }));
    };

    const setRange = (value: DataTypeRepresentative) => {
      changeState((state) => validate({ ...state, range: value }));
    };

    const toggleRangeOverride = () => {
      changeState((state) => validate({ ...state, overrideRange: !state.overrideRange }));
    };

    const setRangeCardinality = (value: Cardinality) => {
      changeState((state) => validate({ ...state, rangeCardinality: value }));
    };

    const toggleRangeCardinalityOverride = () => {
      changeState((state) => validate({ ...state, overrideRangeCardinality: !state.overrideRangeCardinality }));
    };

    return {
      ...entityController,
      ...profileController,
      ...newEntityController,
      toggleNameOverride,
      toggleDescriptionOverride,
      setDomain,
      toggleDomainOverride,
      setDomainCardinality,
      toggleDomainCardinalityOverride,
      setRange,
      toggleRangeOverride,
      setRangeCardinality,
      toggleRangeCardinalityOverride,
    };
  }, [changeState]);
}

function validate(state: CreateAttributeProfileDialogState): CreateAttributeProfileDialogState {

  const domainValidation = state.initialDomain.identifier === state.domain.identifier || !state.overrideDomain ?
    validationNoProblem() : validationWarning("warning-change-domain");

  const domainCardinalityValidation = state.initialDomainCardinality.identifier === state.domainCardinality.identifier || !state.overrideDomainCardinality ?
    validationNoProblem() : validationWarning("warning-change-domain-cardinality");

  const rangeValidation = state.initialRange.identifier === state.range.identifier || !state.overrideRange ?
    validationNoProblem() : validationWarning("warning-change-range");

  const rangeCardinalityValidation = state.initialRangeCardinality.identifier === state.rangeCardinality.identifier || !state.overrideRangeCardinality ?
    validationNoProblem() : validationWarning("warning-change-range-cardinality");

  return {
    ...state,
    domainValidation,
    domainCardinalityValidation,
    rangeValidation,
    rangeCardinalityValidation,
  };
}
