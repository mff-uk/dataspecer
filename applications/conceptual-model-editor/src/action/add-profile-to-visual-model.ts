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
  const visualSources = visualModel.getVisualEntitiesForRepresented(profile.id);
  const visualTargets = visualModel.getVisualEntitiesForRepresented(profiled.id);
  if (visualSources.length === 0 || visualTargets.length === 0) {
    console.warn("Ignored request to add profile as ends are missing in visual model.",
      {visualModel, profiled, profile});
    return;
  }
  for(const visualSource of visualSources) {
    for(const visualTarget of visualTargets) {
      visualModel.addVisualProfileRelationship({
        model: modelIdentifier,
        entity: profile.id,
        waypoints: [],
        visualSource: visualSource.identifier,
        visualTarget: visualTarget.identifier,
      });
    }
  }
}
