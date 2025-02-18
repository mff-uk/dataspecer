import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModelRelationshipUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { getDomainAndRange } from "../util/relationship-utils";
import { ModelGraphContextType } from "../context/model-context";
import { withAggregatedEntity } from "./utilities";
import { isSemanticModelRelationshipProfile, SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { isOwlThing } from "../dataspecer/semantic-model";
import { addVisualRelationship } from "../dataspecer/visual-model/operation/add-visual-relationship";

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
    (item) => isSemanticModelRelationshipUsage(item) || isSemanticModelRelationshipProfile(item),
    (entity) => {
      addSemanticRelationshipProfileToVisualModelCommand(
        notifications, visualModel, entity, modelIdentifier);
    });
}

function addSemanticRelationshipProfileToVisualModelCommand(
  notifications: UseNotificationServiceWriterType,
  visualModel: WritableVisualModel,
  entity: SemanticModelRelationshipUsage | SemanticModelRelationshipProfile,
  model: string,
) {
  const { domain, range } = getDomainAndRange(entity);
  if (domain === null || domain.concept === null || range === null || range.concept === null) {
    notifications.error("Invalid relationship entity.");
    console.error("Ignored relationship as ends are null.", { domain, range, entity });
    return;
  }
  const source = visualModel.getVisualEntityForRepresented(domain.concept);
  const target = visualModel.getVisualEntityForRepresented(range.concept);
  if (source === null || target === null) {
    console.warn("Missing visual entities for ends.", { domain, range, entity, source, target });
    if (isOwlThing(domain.concept) || isOwlThing(range.concept)) {
      // This is special case where owl:Thing is not on canvas.
      // We do not report this to user only log.
    } else {
      notifications.error("Ends of the relation profile are not in the visual model.");
    }
    return;
  }
  //
  addVisualRelationship(
    visualModel, model, entity.id,
    domain.concept, range.concept
  );
}
