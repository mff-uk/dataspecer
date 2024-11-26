import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { isSemanticModelGeneralization, SemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";

import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ModelGraphContextType } from "../context/model-context";
import { withAggregatedEntity } from "./utilities";

export function addSemanticGeneralizationToVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  entityIdentifier: string,
  modelIdentifier: string,
) {
  const entities = graph.aggregatorView.getEntities();
  withAggregatedEntity(notifications, entities,
    entityIdentifier, modelIdentifier,
    isSemanticModelGeneralization, (entity) => {
      addSemanticGeneralizationToVisualModelCommand(
        notifications, visualModel, entity, modelIdentifier);
    });
}

function addSemanticGeneralizationToVisualModelCommand(
  notifications: UseNotificationServiceWriterType,
  visualModel: WritableVisualModel,
  entity: SemanticModelGeneralization,
  model: string,
) {
  const source = visualModel.getVisualEntityForRepresented(entity.child);
  const target = visualModel.getVisualEntityForRepresented(entity.parent);
  if (source === null || target === null) {
    notifications.error("Ends of the relation are not in the visual model.");
    console.error("Ignored generalization as ends are null.", { source, target, entity });
    return;
  }
  //
  visualModel.addVisualRelationship({
    model: model,
    representedRelationship: entity.id,
    waypoints: [],
    visualSource: source.identifier,
    visualTarget: target.identifier,
  });
}
