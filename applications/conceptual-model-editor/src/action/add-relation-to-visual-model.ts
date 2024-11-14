import { isWritableVisualModel } from "@dataspecer/core-v2/visual-model";
import type { ModelGraphContextType } from "../context/model-context";
import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { isSemanticModelGeneralization, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { getDomainAndRange } from "../util/relationship-utils";
import { isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

/**
 * Add resource to the visual model and by doing so to the canvas as well.
 *
 * @param notifications
 * @param graph
 * @param modelIdentifier Owner of the entity to add visual representation for.
 * @param identifier Identifier of semantic entity to add visual representation for.
 */
export function addRelationToVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  modelIdentifier: string,
  identifier: string,
) {
  const visualModel = graph.aggregatorView.getActiveVisualModel();
  if (visualModel === null) {
    notifications.error("There is no active visual model.");
    return;
  }
  if (!isWritableVisualModel(visualModel)) {
    notifications.error("Visual model is not writable.");
    return;
  }
  //
  const entities = graph.aggregatorView.getEntities();
  const entity = entities[identifier].aggregatedEntity;
  if (entity === undefined) {
    notifications.error("Missing semantic entity.");
    return;
  }
  //
  if (isSemanticModelRelationship(entity)) {
    const { domain, range } = getDomainAndRange(entity);
    if (domain === null || domain.concept === null || range === null || range.concept === null) {
      notifications.error("Invalid relationship entity.");
      console.error("Ignored relationship as ends are null.", { domain, range, entity });
      return;
    }
    const source = visualModel.getVisualEntityForRepresented(domain.concept);
    const target = visualModel.getVisualEntityForRepresented(range.concept);
    if (source === null || target === null) {
      notifications.error("Ends of the relation are not in the visual model.");
      console.warn("Missing visual entities for ends.", { domain, range, entity, source, target });
      return;
    }
    //
    visualModel.addVisualRelationship({
      model: modelIdentifier,
      representedRelationship: identifier,
      waypoints: [],
      visualSource: source.identifier,
      visualTarget: target.identifier,
    });
  } else if (isSemanticModelGeneralization(entity)) {
    const source = visualModel.getVisualEntityForRepresented(entity.child);
    const target = visualModel.getVisualEntityForRepresented(entity.parent);
    if (source === null || target === null) {
      console.error("Ignored generalization as ends are null.", { source, target, entity });
      return;
    }
    //
    visualModel.addVisualRelationship({
      model: modelIdentifier,
      representedRelationship: identifier,
      waypoints: [],
      visualSource: source.identifier,
      visualTarget: target.identifier,
    });
  } else if (isSemanticModelRelationshipUsage(entity)) {
    const { domain, range } = getDomainAndRange(entity);
    if (domain === null || domain.concept === null || range === null || range.concept === null) {
      notifications.error("Invalid relationship entity.");
      console.error("Ignored relationship as ends are null.", { domain, range, entity });
      return;
    }
    const source = visualModel.getVisualEntityForRepresented(domain.concept);
    const target = visualModel.getVisualEntityForRepresented(range.concept);
    if (source === null || target === null) {
      notifications.error("Ends of the relation profile are not in the visual model.");
      console.warn("Missing visual entities for ends.", { domain, range, entity, source, target });
      return;
    }
    //
    visualModel.addVisualRelationship({
      model: modelIdentifier,
      representedRelationship: identifier,
      waypoints: [],
      visualSource: source.identifier,
      visualTarget: target.identifier,
    });
  } else {
    notifications.error("Ignored as not sure what entity to add.");
    console.error("Ignored as not sure what entity to add.", {entity});
  }
}
