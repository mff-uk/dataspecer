import { Entity } from "../../../entity-model";
import { SemanticModelEntity } from "../../concepts";
import { NamedThingProfile } from "./named-thing-profile";
import { Profile } from "./profile";

export interface SemanticModelClassProfile extends SemanticModelEntity, Profile, NamedThingProfile {

  type: [typeof SEMANTIC_MODEL_CLASS_PROFILE];

  /**
   * Class profile role.
   * {@link https://mff-uk.github.io/data-specification-vocabulary/class-role/class-role.ttl}.
   */
  role: string | null;

}

export const SEMANTIC_MODEL_CLASS_PROFILE = "class-profile";

export function isSemanticModelClassProfile(entity: Entity | null): entity is SemanticModelClassProfile {
  return entity?.type.includes(SEMANTIC_MODEL_CLASS_PROFILE) ?? false;
}
