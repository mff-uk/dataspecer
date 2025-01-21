import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModelClassUsage, isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ModelGraphContextType } from "../context/model-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { withAggregatedEntity } from "./utilities";
import { addRelatedEntitiesAction } from "./add-related-entities-to-visual-model";
import { ClassesContextType } from "../context/classes-context";
import { findPositionForNewNodesUsingLayouting } from "./layout-visual-model";
import { getVisualNodeContentBasedOnExistingEntities } from "./add-semantic-attribute-to-visual-model";

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
    position = (await findPositionForNewNodesUsingLayouting(notifications, diagram, graph, visualModel, classes, [entityIdentifier]))[entityIdentifier];
  }

  withAggregatedEntity(notifications, entities,
    entityIdentifier, modelIdentifier,
    isSemanticModelClassUsage, (entity) => {
      addSemanticClassProfileToVisualModelCommand(
        classes, visualModel, entity,
        modelIdentifier, position);
      addRelatedEntitiesAction(
        notifications, graph, visualModel, Object.values(entities),
        graph.models, entity);
    });
}

function addSemanticClassProfileToVisualModelCommand(
  classes: ClassesContextType,
  visualModel: WritableVisualModel,
  entity: SemanticModelClassUsage,
  model: string,
  position: { x: number, y: number },
) {
  const content = getVisualNodeContentBasedOnExistingEntities(
    classes, entity);
  visualModel.addVisualNode({
    model: model,
    representedEntity: entity.id,
    position: {
      x: position.x,
      y: position.y,
      anchored: null,
    },
    content,
    visualModels: [],
  });
}
