import { isVisualNode, Waypoint, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { DataspecerError } from "../../dataspecer-error";
import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";

/**
 * @throws DataspecerError
 */
export function addVisualRelationship(
  visualModel: WritableVisualModel,
  model: ModelDsIdentifier,
  represented: EntityDsIdentifier,
  source: EntityDsIdentifier,
  target: EntityDsIdentifier,
) {
  const visualSources = visualModel.getVisualEntitiesForRepresented(source);
  const visualTargets = visualModel.getVisualEntitiesForRepresented(target);
  if (visualSources.length === 0 || visualTargets.length === 0) {
    throw new DataspecerError("Source or target are not in the visual model.");
  }

  for(const visualSource of visualSources) {
    for(const visualTarget of visualTargets) {
      const waypoints: Waypoint[] = [];
      if (visualSource === visualTarget && isVisualNode(visualSource)) {
        const position = visualSource.position;
        waypoints.push({
          x: position.x - 120,
          y: position.y + 10,
          anchored: position.anchored,
        }, {
          x: position.x - 120,
          y: position.y + 50,
          anchored: position.anchored,
        });
      }
      visualModel.addVisualRelationship({
        model,
        representedRelationship: represented,
        waypoints,
        visualSource: visualSource.identifier,
        visualTarget: visualTarget.identifier,
      });
    }
  }
}
