import { Entity } from "../../../entity-model";
import { SemanticModelEntity } from "../../concepts";
import { NamedThingProfile } from "./named-thing-profile";
import { Profile } from "./profile";

export interface SemanticModelClassProfile extends SemanticModelEntity, Profile, NamedThingProfile {
  type: [typeof SEMANTIC_MODEL_CLASS_PROFILE];
}

export const SEMANTIC_MODEL_CLASS_PROFILE = "class-profile";

export function isSemanticModelClassProfile(entity: Entity | null): entity is SemanticModelClassProfile {
  return entity?.type.includes(SEMANTIC_MODEL_CLASS_PROFILE) ?? false;
}
