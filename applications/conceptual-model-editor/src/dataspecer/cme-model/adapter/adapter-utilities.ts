import { CmeClassProfileRole, CmeRelationshipProfileMandatoryLevel } from "../model";

export const asRole = (tags: string[]): CmeClassProfileRole | null => {
  if (tags.includes(CmeClassProfileRole.Main)) {
    return CmeClassProfileRole.Main;
  }
  if (tags.includes(CmeClassProfileRole.Supportive)) {
    return CmeClassProfileRole.Supportive;
  }
  return null;
};

/**
 * The range is the one with the IRI, or just the second one.
 */
export const selectDomainAndRange = <T extends { iri: string | null }>(
  ends: T[],
): T[] => {
  const [first, second] = ends;
  if (isDefined(first?.iri)) {
    return [second, first];
  } else if (isDefined(second?.iri)) {
    return [first, second];
  } else {
    return [first, second];
  }
};

const isDefined = <T>(value: T | null | undefined) => {
  return value !== undefined && value !== null;
};

export const asMandatoryLevel = (
  tags: string[],
): CmeRelationshipProfileMandatoryLevel | null => {
  if (tags.includes(CmeRelationshipProfileMandatoryLevel.Mandatory)) {
    return CmeRelationshipProfileMandatoryLevel.Mandatory;
  }
  if (tags.includes(CmeRelationshipProfileMandatoryLevel.Recommended)) {
    return CmeRelationshipProfileMandatoryLevel.Recommended;
  }
  if (tags.includes(CmeRelationshipProfileMandatoryLevel.Optional)) {
    return CmeRelationshipProfileMandatoryLevel.Optional;
  }
  return null;
}
