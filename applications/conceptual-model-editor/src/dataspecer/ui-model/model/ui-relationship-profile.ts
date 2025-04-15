import { UiEntity } from "./ui-entity";
import { UiReference } from "./ui-reference";

export const UI_RELATIONSHIP_PROFILE_TYPE = "ui-Relationship-profile-type";

export interface UiRelationshipProfile extends UiEntity {

  type: typeof UI_RELATIONSHIP_PROFILE_TYPE;

  displayDomainCardinality: string | null;

  displayRangeCardinality: string | null;

  profiling: UiReference[];

  displayUsageNote: string;

}

export function isUiRelationshipProfile(
  entity: UiEntity | null,
): entity is UiRelationshipProfile {
  return entity?.type === UI_RELATIONSHIP_PROFILE_TYPE;
}
