import { UiEntity } from "./ui-entity";

export const UI_RELATIONSHIP_TYPE = "ui-Relationship-type";

export interface UiRelationship extends UiEntity {

  type: typeof UI_RELATIONSHIP_TYPE;

  displayDomainCardinality: string | null;

  displayRangeCardinality: string | null;

}

export function isUiRelationship(
  entity: UiEntity | null,
): entity is UiRelationship {
  return entity?.type === UI_RELATIONSHIP_TYPE;
}
