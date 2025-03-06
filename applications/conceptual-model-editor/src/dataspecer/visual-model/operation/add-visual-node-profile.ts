import { EntityReference } from "../../entity-model";
import { DataspecerError } from "../../dataspecer-error";
import { VisualOperationExecutor } from "./visual-operation-executor";

/**
 * Adds a visual representation for class profile.
 *
 * @throws DataspecerError
  */
export function addVisualNodeProfile(
  executor: VisualOperationExecutor,
  profile: EntityReference,
  profiled: EntityReference,
) {
  const visualSource =
    executor.visualModel.getVisualEntityForRepresented(profile.identifier);
  const visualTarget =
    executor.visualModel.getVisualEntityForRepresented(profiled.identifier);
  if (visualSource === null || visualTarget === null) {
    console.error("Missing visual representation",
      { profile, profiled, visualSource: visualSource, visualTarget: visualTarget });
    throw new DataspecerError("Can not add visual node profile.");
  }
  executor.visualModel.addVisualProfileRelationship({
    entity: profile.identifier,
    model: profile.model,
    visualSource: visualSource.identifier,
    visualTarget: visualTarget.identifier,
    waypoints: [],
  });
}
