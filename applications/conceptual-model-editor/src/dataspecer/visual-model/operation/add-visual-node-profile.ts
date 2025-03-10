import { EntityReference } from "../../entity-model";
import { DataspecerError } from "../../dataspecer-error";
import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";

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
  const visualSource = visualModel.getVisualEntityForRepresented(profile.identifier);
  const visualTarget = visualModel.getVisualEntityForRepresented(profiled.identifier);
  if (visualSource === null || visualTarget === null) {
    console.error("Missing visual representation",
      { profile, profiled, visualSource: visualSource, visualTarget: visualTarget });
    throw new DataspecerError("Can not add visual node profile.");
  }
  visualModel.addVisualProfileRelationship({
    entity: profile.identifier,
    model: profile.model,
    visualSource: visualSource.identifier,
    visualTarget: visualTarget.identifier,
    waypoints: [],
  });
}
