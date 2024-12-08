import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { isSemanticModelClassUsage, SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ModelGraphContextType } from "../context/model-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { getViewportCenterForClassPlacement, withAggregatedEntity } from "./utilities";
import { addRelatedEntitiesAction } from "./add-related-entities-to-visual-model";
import { ClassesContextType } from "../context/classes-context";
import { findPositionForNewNodeUsingLayouting } from "./layout-visual-model";

export async function addSemanticClassProfileToVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  classes: ClassesContextType,
  visualModel: WritableVisualModel,
  diagram: UseDiagramType,
  entityIdentifier: string,
  modelIdentifier: string,
  position: { x: number, y: number } | null,
) {
  const entities = graph.aggregatorView.getEntities();
  if(position === null) {
    position = await findPositionForNewNodeUsingLayouting(notifications, diagram, graph, classes, entityIdentifier);
  }

  withAggregatedEntity(notifications, entities,
    entityIdentifier, modelIdentifier,
    isSemanticModelClassUsage, (entity) => {
      addSemanticClassProfileToVisualModelCommand(
        visualModel, entity, modelIdentifier,
        position);
      addRelatedEntitiesAction(
        notifications, graph, visualModel, Object.values(entities),
        graph.models, entity);
    });
}

function addSemanticClassProfileToVisualModelCommand(
  visualModel: WritableVisualModel,
  entity: SemanticModelClassUsage,
  model: string,
  position: { x: number, y: number },
) {
  visualModel.addVisualNode({
    model: model,
    representedEntity: entity.id,
    position: {
      x: position.x,
      y: position.y,
      anchored: null,
    },
    content: [],
    visualModels: [],
  });
}
