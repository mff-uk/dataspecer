import { useMemo } from "react";

import { configuration } from "../../application";
import { DialogProps } from "../dialog-api";
import { Cardinality, EntityRepresentative } from "../utilities/dialog-utilities";
import {
  createCreateEntityController,
  createEntityController,
  CreateEntityState,
  CreateEntityStateController,
  createSpecializationController,
  EntityState,
  EntityStateController,
  SpecializationState,
  SpecializationStateController,
} from "../utilities/entity-utilities";


export interface EditAssociationDialogState extends EntityState, CreateEntityState, SpecializationState {

  language: string;

  /**
   * Domain.
   */
  domain: EntityRepresentative;

  /**
   * Domain cardinality.
   */
  domainCardinality: Cardinality;

  /**
   * Available domain items.
   */
  availableDomainItems: EntityRepresentative[];

  /**
   * Range.
   */
  range: EntityRepresentative;

  /**
   * Range cardinality.
   */
  rangeCardinality: Cardinality;

  /**
   * Available range items.
   */
  availableRangeItems: EntityRepresentative[];

  availableCardinalities: Cardinality[];

}

export interface EditAssociationDialogController extends EntityStateController, CreateEntityStateController, SpecializationStateController {

  setDomain: (value: EntityRepresentative) => void;

  setDomainCardinality: (value: Cardinality) => void;

  setRange: (value: EntityRepresentative) => void;

  setRangeCardinality: (value: Cardinality) => void;

}

export function useEditAssociationDialogController({ changeState }: DialogProps<EditAssociationDialogState>): EditAssociationDialogController {

  return useMemo(() => {

    const entityController = createEntityController(changeState);

    const newEntityController = createCreateEntityController(
      changeState, entityController, configuration().nameToIri);

    const specializationController = createSpecializationController(changeState);

    const setDomain = (value: EntityRepresentative) => {
      changeState((state) => ({ ...state, domain: value }));
    };

    const setDomainCardinality = (value: Cardinality) => {
      changeState((state) => ({ ...state, domainCardinality: value }));
    };

    const setRange = (value: EntityRepresentative) => {
      changeState((state) => ({ ...state, range: value }));
    };

    const setRangeCardinality = (value: Cardinality) => {
      changeState((state) => ({ ...state, rangeCardinality: value }));
    };

    return {
      ...entityController,
      ...newEntityController,
      ...specializationController,
      setDomain,
      setDomainCardinality,
      setRange,
      setRangeCardinality,
    };
  }, [changeState]);
}
