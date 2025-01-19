import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModelClass, isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";

import { withAggregatedEntity } from "./utilities";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ModelGraphContextType } from "../context/model-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { addRelatedEntitiesAction } from "./add-related-entities-to-visual-model";
import { findPositionForNewNodesUsingLayouting } from "./layout-visual-model";
import { ClassesContextType } from "../context/classes-context";
import { getVisualNodeContentBasedOnExistingEntities } from "./add-semantic-attribute-to-visual-model";

export async function addSemanticClassToVisualModelAction(
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
    isSemanticModelClass, (entity) => {
      addSemanticClassToVisualModelCommand(
        classes, visualModel, entity,
        modelIdentifier, position);
      addRelatedEntitiesAction(
        notifications, graph, visualModel, Object.values(entities),
        graph.models, entity);
    });
}

function addSemanticClassToVisualModelCommand(
  classes: ClassesContextType,
  visualModel: WritableVisualModel,
  entity: SemanticModelClass,
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
