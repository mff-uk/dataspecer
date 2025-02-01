import { Entity } from "../../../entity-model";
import { SemanticModelEntity } from "../../concepts";
import { NamedThingProfile } from "./named-thing-profile";
import { Profile } from "./profile";

/**
 * For now we do not extend {@link NamedThingProfile} here.
 * We store data using the end with the "iri" set.
 * As a result the relationship entity is basically blank.
 */
export interface SemanticModelRelationshipProfile extends Entity {

  type: [typeof SEMANTIC_MODEL_RELATIONSHIP_PROFILE];

  ends: SemanticModelRelationshipEndProfile[];

}

export const SEMANTIC_MODEL_RELATIONSHIP_PROFILE = "class-profile";

export function isSemanticModelRelationshipProfile(entity: Entity | null): entity is SemanticModelRelationshipProfile {
  return entity?.type.includes(SEMANTIC_MODEL_RELATIONSHIP_PROFILE) ?? false;
}

export interface SemanticModelRelationshipEndProfile extends NamedThingProfile, Profile {

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
