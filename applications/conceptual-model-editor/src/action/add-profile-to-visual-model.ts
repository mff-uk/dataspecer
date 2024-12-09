import { SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";

/**
 * Add visual representation for a profile relation.
 */
export function addSemanticProfileToVisualModelAction(
  visualModel: WritableVisualModel,
  profiled: SemanticModelEntity,
  profileOf: SemanticModelEntity,
  modelIdentifier: string,
) {
  const visualSource = visualModel.getVisualEntityForRepresented(profiled.id);
  const visualTarget = visualModel.getVisualEntityForRepresented(profileOf.id);
  if (visualSource === null || visualTarget === null) {
    console.warn("Ignored request to add profile, but ends are missing in visual model.",
      {visualModel, profiled, profileOf});
    return;
  }
  visualModel.addVisualProfileRelationship({
    model: modelIdentifier,
    entity: profiled.id,
    waypoints: [],
    visualSource: visualSource.identifier,
    visualTarget: visualTarget.identifier,
  });
}
