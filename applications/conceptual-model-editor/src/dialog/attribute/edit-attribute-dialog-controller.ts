import { useMemo } from "react";

import { configuration } from "../../application";
import { DialogProps } from "../dialog-api";
import { createCreateEntityController, createEntityController, CreateEntityState, CreateEntityStateController, EntityState, EntityStateController } from "../utilities/entity-utilities";
import { Cardinality, DataTypeRepresentative, EntityRepresentative } from "../utilities/dialog-utilities";

export interface CreateAttributeDialogState extends EntityState, CreateEntityState {

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


export interface CreateAttributeDialogController extends EntityStateController, CreateEntityStateController {

  setDomain: (value: EntityRepresentative) => void;

  setDomainCardinality: (value: Cardinality) => void;

  setRange: (value: DataTypeRepresentative) => void;

  setRangeCardinality: (value: Cardinality) => void;

}

export function useCreateAttributeDialogController({ changeState }: DialogProps<CreateAttributeDialogState>): CreateAttributeDialogController {

  return useMemo(() => {

    const entityController = createEntityController(changeState);

    const newEntityController = createCreateEntityController(
      changeState, entityController, configuration().nameToIri);

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
      setDomain,
      setDomainCardinality,
      setRange,
      setRangeCardinality,
    };
  }, [changeState]);
}
