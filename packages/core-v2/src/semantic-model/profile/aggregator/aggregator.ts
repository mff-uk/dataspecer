import { Entity, EntityIdentifier } from "../../../entity-model/entity";
import { LanguageString, SemanticModelClass, SemanticModelRelationship } from "../../concepts";
import { isSemanticModelClassProfile, isSemanticModelRelationshipProfile, SemanticModelClassProfile, SemanticModelRelationshipProfile } from "../concepts";

/**
 * Given an entity analyze and return dependencies to other entities.
 */
export interface DependencyAnalyzer {

  /**
   * @returns Null it the entity is not known to the analyzer.
   */
  dependencies(entity: Entity) : EntityIdentifier[] | null;

}

export interface ProfileAggregator {

  aggregateSemanticModelClassProfile(
    profile: SemanticModelClassProfile,
    aggregatedProfiled: (SemanticModelClassProfile | SemanticModelClass)[],
  ) : SemanticModelClassProfile;

  aggregateSemanticModelRelationshipProfile(
    profile: SemanticModelRelationshipProfile,
    aggregatedProfiled: (SemanticModelRelationshipProfile | SemanticModelRelationship)[],
  ): SemanticModelRelationshipProfile;

}

export interface ProfileEntityAggregator extends DependencyAnalyzer, ProfileAggregator {

}

class DefaultProfileEntityAggregator implements ProfileEntityAggregator {

  dependencies(entity: Entity): EntityIdentifier[] | null {
    if (isSemanticModelClassProfile(entity)) {
      return entity.profiling;
    }
    if (isSemanticModelRelationshipProfile(entity)) {
      // We need to collect from the edges.
      return entity.ends.map(item => item.profiling).flat()
    }
    return null;
  }

  aggregateSemanticModelClassProfile(
    profile: SemanticModelClassProfile,
    aggregatedProfiled: (SemanticModelClassProfile | SemanticModelClass)[],
  ): SemanticModelClassProfile {
    const profiled = createProfiledGetter(aggregatedProfiled, profile);

    let usageNote: LanguageString | null = null;
    const usageNoteProfiled = profiled(profile.usageNoteFromProfiled);
    if (usageNoteProfiled !== undefined && isSemanticModelClassProfile(usageNoteProfiled)) {
      usageNote = usageNoteProfiled.usageNote;
    } else {
      usageNote = profile.usageNote;
    }

    return {
      id: profile.id,
      type: profile.type,
      profiling: profile.profiling,
      iri: profile.iri,
      //
      usageNote,
      usageNoteFromProfiled: profile.usageNoteFromProfiled,
      //
      name: profiled(profile.nameFromProfiled)?.name ?? null,
      nameFromProfiled: profile.nameFromProfiled,
      description: profiled(profile.nameFromProfiled)?.description ?? null,
      descriptionFromProfiled: profile.descriptionFromProfiled,
    };
  }

  aggregateSemanticModelRelationshipProfile(
    profile: SemanticModelRelationshipProfile,
    aggregatedProfiled: (SemanticModelRelationshipProfile | SemanticModelRelationship)[],
  ): SemanticModelRelationshipProfile {
    const profiled = createProfiledGetter(aggregatedProfiled, profile);

    return {
      id: profile.id,
      type: profile.type,
      //
      ends: profile.ends.map((end, index) => ({
        profiling: end.profiling,
        iri: end.iri,
        //
        name: profiled(end.nameFromProfiled)?.ends[index]?.name ?? null,
        nameFromProfiled: end.nameFromProfiled,
        description: profiled(end.descriptionFromProfiled)?.ends[index]?.description ?? null,
        descriptionFromProfiled: end.descriptionFromProfiled,
        usageNote: (() => {
          // We need to do some computation.
          const source = profiled(end.descriptionFromProfiled);
          if (isSemanticModelRelationshipProfile(source)) {
            return source.ends[index]?.usageNote ?? end.usageNote;
          } else {
            return end.usageNote;
          }
        })(),
        usageNoteFromProfiled: end.usageNoteFromProfiled,
        concept: profiled(end.descriptionFromProfiled)?.ends[index]?.concept ?? null,
        conceptFromProfiled: end.conceptFromProfiled,
        cardinality: profiled(end.descriptionFromProfiled)?.ends[index]?.cardinality ?? null,
        cardinalityFromProfiled: end.cardinalityFromProfiled,
      })),
    }
  }
}

function createProfiledGetter<T extends {id: string}> (
  items: T[],
  defaultItem: T
): (id: string | null) => T | null {
  const map : Record<string, T> = {};
  items.forEach(item => map[item.id] = item);
  return (id: string | null) => map[id ?? ""] ?? defaultItem ?? null;
}

export function createDefaultProfileEntityAggregator() : ProfileEntityAggregator {
  return new DefaultProfileEntityAggregator();
}
