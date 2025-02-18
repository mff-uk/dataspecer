import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { EntityReference } from "../../entity-model";
import { DataspecerError } from "../../dataspecer-error";

/**
 * Adds a visual representation for class profile.
 *
 * @throws DataspecerError
  */
export function addVisualNodeProfile(
  visualModel: WritableVisualModel,
  profile: EntityReference,
  profiled: EntityReference,
) {
  const source = visualModel.getVisualEntityForRepresented(profile.identifier);
  const target = visualModel.getVisualEntityForRepresented(profiled.identifier);
  if (source === null || target === null) {
    console.error("Missing visual representation",
      { profile, profiled, visualSource: source, visualTarget: target });
    throw new DataspecerError("Can not add visual node profile.");
  }
  visualModel.addVisualProfileRelationship({
    entity: profile.identifier,
    model: profile.model,
    visualSource: source.identifier,
    visualTarget: target.identifier,
    waypoints: [],
  });
}
