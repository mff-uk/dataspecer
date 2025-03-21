import { getDomainAndRange } from "../../util/relationship-utils";

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
