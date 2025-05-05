import { isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationship, SemanticModelEntity } from "../concepts/index.ts";
import { isSemanticModelClassProfile, isSemanticModelRelationshipProfile } from "../profile/concepts/index.ts";

export const isIriAbsolute = (iri: string | null) => {
  if (!iri) {
    return false;
  }

  return iri.includes("://");
};

/**
 * Converts given iri to absolute iri if it is not already absolute.
 */
export function iriToAbsolute(iri: string | null, baseIri?: string): string | null {
  if (!iri) {
    return null;
  }
  if (isIriAbsolute(iri)) {
    return iri;
  } else {
    return (baseIri ?? "") + iri;
  }
}

/**
 * Converts entity to entity with absolute iri.
 */
export function withAbsoluteIri<T extends SemanticModelEntity>(entity: T, baseIri?: string): T {
  if (!baseIri) {
    return entity;
  }

  if (isSemanticModelClass(entity) || isSemanticModelClassProfile(entity)) {
    return { ...entity, iri: iriToAbsolute(entity.iri, baseIri) };
  }
  if (isSemanticModelRelationship(entity) || isSemanticModelRelationshipProfile(entity)) {
    const ends = entity.ends.map((end) => {
      return { ...end, iri: iriToAbsolute(end.iri, baseIri) };
    });
    return { ...entity, ends };
  }
  if (isSemanticModelGeneralization(entity)) {
    return entity;
  }

  return entity;
}
