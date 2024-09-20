
import { type InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createClass as createSemanticModel } from "@dataspecer/core-v2/semantic-model/operations";

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

  const operation = createSemanticModel({
    iri: state.iri,
    name: state.name,
    description: state.description,
  });

  const newClass = model.executeOperation(operation);
  if (newClass.success === false || newClass.id === undefined) {
    notifications.error("We have not recieved the id of newly created class. See logs for more detail.");
    logger.error("We have not recieved the id of newly created class.", { "operation": newClass });
    return;
  }

  if (position === null) {
    return;
  }

  const visualModel = graph.aggregatorView.getActiveVisualModel();
  if (visualModel === null) {
    notifications.error("There is no active visual model.");
    return;
  }

  visualModel.addEntity({
    sourceEntityId: newClass.id,
    position: position,
  });

}