import { Entity } from "../../../entity-model";
import { SemanticModelEntity } from "../../concepts";
import { NamedThingProfile } from "./named-thing-profile";
import { Profile } from "./profile";

export interface SemanticModelClassProfile extends SemanticModelEntity, Profile, NamedThingProfile {

  type: [typeof SEMANTIC_MODEL_CLASS_PROFILE];

  /**
   * This value is not inherited from profiled entity.
   * {@link https://mff-uk.github.io/data-specification-vocabulary/class-role/class-role.ttl}.
   *
    * This value is optional as it can be missing in the source data.
    * You should not set the value to undefined manually.
    * Use null to indicate an absence of a value.
   */
  role?: string | null;

}

export const SEMANTIC_MODEL_CLASS_PROFILE = "class-profile";

export function isSemanticModelClassProfile(entity: Entity | null): entity is SemanticModelClassProfile {
  return entity?.type.includes(SEMANTIC_MODEL_CLASS_PROFILE) ?? false;
}
