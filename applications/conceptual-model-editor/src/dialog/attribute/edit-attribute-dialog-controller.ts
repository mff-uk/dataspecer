import { useMemo } from "react";

import { configuration } from "../../application";
import { DialogProps } from "../dialog-api";
import { createCreateEntityController, createEntityController, CreateEntityState, CreateEntityStateController, createSpecializationController, EntityState, EntityStateController, SpecializationState, SpecializationStateController } from "../utilities/entity-utilities";
import { Cardinality, DataTypeRepresentative, EntityRepresentative } from "../utilities/dialog-utilities";

export interface EditAttributeDialogState extends EntityState, CreateEntityState, SpecializationState {

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
  range: DataTypeRepresentative;

  /**
   * Range cardinality.
   */
  rangeCardinality: Cardinality;

  /**
   * Available range items.
   */
  availableRangeItems: DataTypeRepresentative[];

  availableCardinalities: Cardinality[];

}


export interface EditAttributeDialogController extends EntityStateController, CreateEntityStateController, SpecializationStateController {

  setDomain: (value: EntityRepresentative) => void;

  setDomainCardinality: (value: Cardinality) => void;

  setRange: (value: DataTypeRepresentative) => void;

  setRangeCardinality: (value: Cardinality) => void;

}

export function useEditAttributeDialogController({ changeState }: DialogProps<EditAttributeDialogState>): EditAttributeDialogController {

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

    const setRange = (value: DataTypeRepresentative) => {
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
