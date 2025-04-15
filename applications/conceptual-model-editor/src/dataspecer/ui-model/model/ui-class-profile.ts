import { UiEntity } from "./ui-entity";
import { UiReference } from "./ui-reference";

export const UI_CLASS_PROFILE_TYPE = "ui-class-profile-type";

export interface UiClassProfile extends UiEntity {

  type: typeof UI_CLASS_PROFILE_TYPE;

  iri: string;

  displayDescription: string;

  profiling: UiReference[];

  displayUsageNode: string;

}

export function isUiClassProfile(
  entity: UiEntity | null,
): entity is UiClassProfile {
  return entity?.type === UI_CLASS_PROFILE_TYPE;
}
