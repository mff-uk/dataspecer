import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModelRelationship, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";

import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { getDomainAndRange } from "../util/relationship-utils";
import { ModelGraphContextType } from "../context/model-context";
import { getVisualSourcesAndVisualTargets, withAggregatedEntity } from "./utilities";
import { addVisualRelationship } from "../dataspecer/visual-model/operation/add-visual-relationship";

/**
 * Adds given semantic relationship to visual model.
 * If {@link visualSources} or {@link visualTargets} are null then this method creates
 * connections between all visual ends given by the semantic relationship identified by {@link entityIdentifier}.
 * Otherwise the given {@link visualSources}, respectively {@link visualTargets} are used as the sources or targets
 * of the created visual relationships.
 */
export function addSemanticRelationshipToVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  entityIdentifier: string,
  modelIdentifier: string,
  visualSources: string[] | null,
  visualTargets: string[] | null,
) {
  const entities = graph.aggregatorView.getEntities();
  withAggregatedEntity(notifications, entities,
    entityIdentifier, modelIdentifier,
    isSemanticModelRelationship, (entity) => {
      addSemanticRelationshipToVisualModelCommand(
        notifications, visualModel, entity, modelIdentifier,
        visualSources, visualTargets);
    });
}

function addSemanticRelationshipToVisualModelCommand(
  notifications: UseNotificationServiceWriterType,
  visualModel: WritableVisualModel,
  entity: SemanticModelRelationship,
  model: string,
  givenVisualSources: string[] | null,
  givenVisualTargets: string[] | null,
) {
  const { domain, range } = getDomainAndRange(entity);
  if (domain === null || domain.concept === null || range === null || range.concept === null) {
    notifications.error("Invalid relationship entity.");
    console.error("Ignored relationship as ends are null.", { domain, range, entity });
    return;
  }
  const { visualSources, visualTargets } = getVisualSourcesAndVisualTargets(
    visualModel, entity, domain.concept, range.concept, givenVisualSources, givenVisualTargets);
  if (visualSources.length === 0 || visualTargets.length === 0) {
    notifications.error("Ends of the relation are not in the visual model.");
    console.warn("Missing visual entities for ends.", { domain, range, entity, visualSources, visualTargets });
    return;
  }
  //
  addVisualRelationship(
    visualModel, model, entity.id,
    domain.concept, range.concept,
    givenVisualSources, givenVisualTargets
  );
}
