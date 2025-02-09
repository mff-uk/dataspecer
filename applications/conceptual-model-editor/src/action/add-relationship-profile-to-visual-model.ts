import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModelRelationshipUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { getDomainAndRange } from "../util/relationship-utils";
import { ModelGraphContextType } from "../context/model-context";
import { withAggregatedEntity } from "./utilities";

export function addSemanticRelationshipProfileToVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  entityIdentifier: string,
  modelIdentifier: string,
) {
  const entities = graph.aggregatorView.getEntities();
  withAggregatedEntity(notifications, entities,
    entityIdentifier, modelIdentifier,
    isSemanticModelRelationshipUsage, (entity) => {
      addSemanticRelationshipProfileToVisualModelCommand(
        notifications, visualModel, entity, modelIdentifier);
    });
}

function addSemanticRelationshipProfileToVisualModelCommand(
  notifications: UseNotificationServiceWriterType,
  visualModel: WritableVisualModel,
  entity: SemanticModelRelationshipUsage,
  model: string,
) {
  const { domain, range } = getDomainAndRange(entity);
  if (domain === null || domain.concept === null || range === null || range.concept === null) {
    notifications.error("Invalid relationship entity.");
    console.error("Ignored relationship as ends are null.", { domain, range, entity });
    return;
  }
  const sources = visualModel.getVisualEntitiesForRepresented(domain.concept);
  const targets = visualModel.getVisualEntitiesForRepresented(range.concept);
  if (sources === null || targets === null) {
    notifications.error("Ends of the relation profile are not in the visual model.");
    console.warn("Missing visual entities for ends.", { domain, range, entity, sources, targets });
    return;
  }
  //
  for(const source of sources) {
    for(const target of targets) {
      visualModel.addVisualRelationship({
        model: model,
        representedRelationship: entity.id,
        waypoints: [],
        visualSource: source.identifier,
        visualTarget: target.identifier,
      });
    }
  }
}
