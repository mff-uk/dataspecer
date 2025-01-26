import { Entity } from "../../../entity-model";
import { LanguageString, NamedThing, SemanticModelEntity } from "../../concepts";

/**
 * The idea of profile is to put certain entity, or a profile, into given context.
 * A single profile entity can profile multiple other entities.
 */
interface Profile {

  /**
   * ID of all profiled entities.
   */
  profiling: string[];

  /**
   * Optional information about the profile of the entity.
   * If there is change in the meaning in the new context, is should be explained here.
   */
  usageNote: LanguageString | null;

  /**
   * If set, the value of respective property must be load from the profile.
   */
  usageFromProfiled: string | null;

}

/**
 * For each property we can have a value, or inherit it from a given profiled entity.
 */
interface NamedThingProfile extends NamedThing, Profile {

  /**
   * If set, the value of respective property must be load from the profile.
   */
  nameFromProfiled: string | null;

  /**
   * If set, the value of respective property must be load from the profile.
   */
  descriptionFromProfiled: string | null;

}


export interface SemanticModelClassProfile extends SemanticModelEntity, NamedThingProfile {
  type: [typeof SEMANTIC_MODEL_CLASS_PROFILE];
}

export const SEMANTIC_MODEL_CLASS_PROFILE = "class-profile";

export function isSemanticModelClassProfile(entity: Entity | null): entity is SemanticModelClassProfile {
  return entity?.type.includes(SEMANTIC_MODEL_CLASS_PROFILE) ?? false;
}

export interface SemanticModelRelationshipProfile extends SemanticModelEntity, Profile {
  type: [typeof SEMANTIC_MODEL_RELATIONSHIP_PROFILE];

  ends: SemanticModelRelationshipEndProfile[];
}

export const SEMANTIC_MODEL_RELATIONSHIP_PROFILE = "class-profile";

export function isSemanticModelRelationshipProfile(entity: Entity | null): entity is SemanticModelRelationshipProfile {
  return entity?.type.includes(SEMANTIC_MODEL_RELATIONSHIP_PROFILE) ?? false;
}

export interface SemanticModelRelationshipEndProfile extends NamedThingProfile, Profile  {

  /**
   * Public, usually globally-recognized, identifier of the entity.
   * The value may be null indicating that the entity has no public IRI.
   * @example http://xmlns.com/foaf/0.1/Person
   *
   * IRI may be relative to the base IRI of the model.
   */
  iri: string | null;

  /**
   * Must be descendant or self of the corresponding concept of the used entity.
   */
  concept: string | null;

  /**
   * If set, the value of respective property must be load from the profile.
   */
  conceptFromProfiled: string | null;

  /**
   * Must be stricter or equal to the corresponding cardinality of the profiled entity.
   */
  cardinality: [number, number | null] | null;

  /**
   * If set, the value of respective property must be load from the profile.
   */
  cardinalityFromProfiled: string | null;

}
