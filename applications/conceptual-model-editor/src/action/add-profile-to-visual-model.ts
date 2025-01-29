import { SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";

/**
 * Add visual representation for a profile relation.
 *
 * The given entities must be raw entities not aggregates.
 */
export function addSemanticProfileToVisualModelAction(
  visualModel: WritableVisualModel,
  profiled: SemanticModelEntity,
  profile: SemanticModelEntity,
  modelIdentifier: string,
) {
  const visualSource = visualModel.getVisualEntityForRepresented(profile.id);
  const visualTarget = visualModel.getVisualEntityForRepresented(profiled.id);
  if (visualSource === null || visualTarget === null) {
    console.warn("Ignored request to add profile as ends are missing in visual model.",
      {visualModel, profiled, profile});
    return;
  }
  visualModel.addVisualProfileRelationship({
    model: modelIdentifier,
    entity: profile.id,
    waypoints: [],
    visualSource: visualSource.identifier,
    visualTarget: visualTarget.identifier,
  });
}
