import { isVisualNode, Waypoint } from "@dataspecer/core-v2/visual-model";
import { DataspecerError } from "../../dataspecer-error";
import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";
import { VisualOperationExecutor } from "./visual-operation-executor";

/**
 * @throws DataspecerError
 */
export function addVisualRelationship(
  executor: VisualOperationExecutor,
  model: ModelDsIdentifier,
  represented: EntityDsIdentifier,
  source: EntityDsIdentifier,
  target: EntityDsIdentifier,
) {
  const visualSource =
    executor.visualModel.getVisualEntityForRepresented(source);
  const visualTarget =
    executor.visualModel.getVisualEntityForRepresented(target);
  if (visualSource === null || visualTarget === null) {
    throw new DataspecerError("Source or target are not in the visual model.");
  }
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
  executor.visualModel.addVisualRelationship({
    model: model,
    representedRelationship: represented,
    waypoints,
    visualSource: visualSource.identifier,
    visualTarget: visualTarget.identifier,
  });
}
