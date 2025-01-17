import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { DataspecerError } from "../../dataspecer-error";
import { EntityDsIdentifier } from "../../entity-model";

/**
 * @throws DataspecerError
 */
export function addVisualRelationship(
  visualModel: WritableVisualModel,
  model: string,
  represented: EntityDsIdentifier,
  source: EntityDsIdentifier,
  target: EntityDsIdentifier,
) {
  const visualSource = visualModel.getVisualEntityForRepresented(source);
  const visualTarget = visualModel.getVisualEntityForRepresented(target);
  if (visualSource === null || visualTarget === null) {
    throw new DataspecerError("Source or target are not in the visual model.");
  }
  visualModel.addVisualRelationship({
    model: model,
    representedRelationship: represented,
    waypoints: [],
    visualSource: visualSource.identifier,
    visualTarget: visualTarget.identifier,
  });
}
