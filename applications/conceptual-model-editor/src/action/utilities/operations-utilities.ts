import { Entity } from "@dataspecer/core-v2";
import { Operation, createGeneralization, deleteEntity } from "@dataspecer/core-v2/semantic-model/operations";

import { getDomainAndRange } from "../../util/relationship-utils";
import { SpecializationState } from "../../dialog/utilities/specialization-utilities";

/**
 * Produce operations to reflect changes in specializations.
 */
export function specializationStateToOperations(
  entity: Entity,
  prevState: SpecializationState,
  nextState: SpecializationState,
) {
  const operations: Operation[] = [];
  // Create new specializations.
  for (const item of nextState.specializations) {
    if (prevState.specializations.includes(item)) {
      continue;
    }
    operations.push(createGeneralization({
      iri: item.iri,
      parent: item.specialized,
      child: entity.id,
    }));
  }
  // Remove specializations.
  for (const item of prevState.specializations) {
    if (nextState.specializations.includes(item) || item.identifier === undefined) {
      continue;
    }
    operations.push(deleteEntity(item.identifier));
  }
  return operations;
}

/**
 * Given updates to range and domain produce updated ends.
 * Should be called with ends from the entity.
 * Do not call this with aggregated ends.
 */
export function mergeEndsUpdate<EndType extends { iri: string | null }, EndUpdateType extends EndType>(
  entity: { ends: EndType[] },
  domainUpdate: Partial<EndUpdateType>,
  rangeUpdate: Partial<EndUpdateType>,
): EndType[] {
  const domainAndRange = getDomainAndRange(entity);
  const domain: EndType = {
    ...domainAndRange.domain!,
    ...domainUpdate,
  };
  const range: EndType = {
    ...domainAndRange.range!,
    ...rangeUpdate,
  };
  if (domainAndRange.domainIndex === 1 && domainAndRange.rangeIndex === 0) {
    return [range, domain];
  } else {
    return [domain, range];
  }
}
