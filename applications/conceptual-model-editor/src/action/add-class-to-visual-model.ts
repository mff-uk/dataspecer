import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";

import { withAggregatedEntity } from "./utilities";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ModelGraphContextType } from "../context/model-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { addRelatedEntitiesAction } from "./add-related-entities-to-visual-model";
import { findPositionForNewNodesUsingLayouting } from "./layout-visual-model";
import { ClassesContextType } from "../context/classes-context";
import { addVisualNode } from "../dataspecer/visual-model/command/add-visual-node";

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
      // TODO PRQuestion: How to handle this? Put it into the addVisualNode_
      const content = getVisualNodeContentBasedOnExistingEntities(
        classes, entity);
      addVisualNode(visualModel, entity, modelIdentifier, position, content);
      addRelatedEntitiesAction(
        notifications, graph, visualModel, Object.values(entities),
        graph.models, entity);
    });
}
