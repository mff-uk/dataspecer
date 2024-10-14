
import { type InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createClass as createClassInSemanticModel } from "@dataspecer/core-v2/semantic-model/operations";
import { isWritableVisualModel } from "@dataspecer/core-v2/visual-model";

import { logger } from "../application";
import { type EditClassState } from "../dialog/class/edit-class-dialog-controller";
import { type UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { type ModelGraphContextType } from "../context/model-context";

export function createClass(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  model: InMemorySemanticModel,
  position: { x: number, y: number } | null,
  state: EditClassState) {

  const operation = createClassInSemanticModel({
    iri: state.iri,
    name: state.name,
    description: state.description,
  });

  const newClass = model.executeOperation(operation);
  if (newClass.success === false || newClass.id === undefined) {
    notifications.error("We have not received the id of newly created class. See logs for more detail.");
    logger.error("We have not received the id of newly created class.", { "operation": newClass });
    return;
  }

  if (position === null) {
    return;
  }

  const visualModel = graph.aggregatorView.getActiveVisualModel();
  if (visualModel === null || !isWritableVisualModel(visualModel)) {
    notifications.error("There is no active visual model.");
    return;
  }

  visualModel.addVisualNode({
    model: model.getId(),
    representedEntity: newClass.id,
    position: {
      ...position,
      anchored: null,
    },
    content: [],
    visualModels: [],
  });

}