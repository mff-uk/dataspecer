import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { getSelectionForWholeSemanticModel } from "./extend-selection-action";
import { EntityToAddToVisualModel, addSemanticEntitiesToVisualModelAction } from "./add-semantic-entities-to-visual-model";
import { ClassesContextType } from "../context/classes-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { EntityModel } from "@dataspecer/core-v2";

/**
 * Adds entities from given semantic model identified by {@link semanticModelIdentifier} to currently active visual model.
 */
export const addEntitiesFromSemanticModelToVisualModelAction = (
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  visualModel: WritableVisualModel,
  semanticModel: EntityModel
): void => {
  // Passing in true, because the classic relationships are added by default when adding class
  // while the relationship profiles are not
  const entitiesFromSemanticModel = getSelectionForWholeSemanticModel(semanticModel, visualModel, true);
  const entitiesToAddToVisualModel: EntityToAddToVisualModel[] = entitiesFromSemanticModel.nodeSelection.map(node => ({
    identifier: node,
    position: null,
  }));

  entitiesToAddToVisualModel.push(...entitiesFromSemanticModel.edgeSelection.map(edge => ({identifier: edge, position: null})));
  addSemanticEntitiesToVisualModelAction(notifications, classes, graph, visualModel, diagram, entitiesToAddToVisualModel);
};
