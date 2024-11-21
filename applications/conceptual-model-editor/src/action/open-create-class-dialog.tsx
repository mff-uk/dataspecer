import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { isWritableVisualModel, VisualModel } from "@dataspecer/core-v2/visual-model";

import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { CreateClassDialogState, createCreateClassDialogState } from "../dialog/class/create-class-dialog-controller";
import { Options, createLogger } from "../application";
import { createCreateClassDialog } from "../dialog/class/create-class-dialog";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { firstInMemorySemanticModel } from "../utilities/model";
import { createClass as createClassOperation, createGeneralization } from "@dataspecer/core-v2/semantic-model/operations";
import { addSemanticClassToVisualModelAction } from "./add-class-to-visual-model";
import { UseDiagramType } from "../diagram/diagram-hook";

const LOG = createLogger(import.meta.url);

/**
 * Open and handle create class dialog.
 */
export function openCreateClassDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  notifications: UseNotificationServiceWriterType,
  visualModel: VisualModel | null,
  diagram: UseDiagramType,
  defaultModel: InMemorySemanticModel | null,
  position: { x: number, y: number } | null,
) {

  const model = defaultModel ?? getDefaultModel(graph);
  if (model === null) {
    notifications.error("You have to create a writable vocabulary first!");
    return;
  }

  const onConfirm = (state: CreateClassDialogState) => {
    // Create class.
    const createResult = createSemanticClass(notifications, state);
    if (createResult === null) {
      return;
    }
    // Add to visual model if possible.
    if (isWritableVisualModel(visualModel)) {
      addSemanticClassToVisualModelAction(
        notifications, graph, visualModel, diagram,
        createResult.identifier, createResult.model.getId(),
        position);
    }
  };

  openCreateClassDialog(
    options, dialogs, classes, graph, visualModel, model, onConfirm);
}

function getDefaultModel(graph: ModelGraphContextType): InMemorySemanticModel | null {
  return firstInMemorySemanticModel(graph.models);
}

function createSemanticClass(
  notifications: UseNotificationServiceWriterType,
  state: CreateClassDialogState): {
    identifier: string,
    model: InMemorySemanticModel
  } | null {

  const operation = createClassOperation({
    iri: state.iri,
    name: state.name,
    description: state.description,
  });

  const model: InMemorySemanticModel = state.model.model;
  const newClass = model.executeOperation(operation);
  if (newClass.success === false || newClass.id === undefined) {
    notifications.error("We have not received the id of newly created class. See logs for more detail.");
    LOG.error("We have not received the id of newly created class.", { "operation": newClass });
    return null;
  }

  // Perform additional modifications for which we need to have the class identifier.
  const operations = [];
  for (const specialization of state.specializations) {
    operations.push(createGeneralization({
      parent: specialization.specialized,
      child: newClass.id,
      iri: specialization.iri,
    }));
  }
  model.executeOperations(operations);

  return {
    identifier: newClass.id,
    model,
  };

}

function openCreateClassDialog(
  options: Options,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  visualModel: VisualModel | null,
  model: InMemorySemanticModel,
  onConfirm: (state: CreateClassDialogState) => void,
) {
  const state = createCreateClassDialogState(
    classes, graph, visualModel, options.language, model);
  dialogs.openDialog(createCreateClassDialog(state, onConfirm));
}
