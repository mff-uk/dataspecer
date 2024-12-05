import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { modifyClass, Operation } from "@dataspecer/core-v2/semantic-model/operations";
import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";

import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { Options } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { specializationStateToOperations } from "./utilities/operations-utilities";
import { createEditClassDialogState } from "../dialog/class/create-edit-class-dialog-state";
import { EditClassDialogState } from "../dialog/class/edit-class-dialog-controller";
import { createEditClassDialog } from "../dialog/class/edit-class-dialog";

export function openEditClassDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  notifications: UseNotificationServiceWriterType,
  visualModel: VisualModel | null,
  model: InMemorySemanticModel,
  entity: SemanticModelClass,
) {
  const state = createEditClassDialogState(
    classes, graph, visualModel, options.language, model, entity);

  const onConfirm = (nextState: EditClassDialogState) => {
    updateSemanticClass(notifications, entity, state, nextState);
  };

  dialogs.openDialog(createEditClassDialog(state, onConfirm));
}

function updateSemanticClass(
  notifications: UseNotificationServiceWriterType,
  entity: SemanticModelClass,
  prevState: EditClassDialogState,
  nextState: EditClassDialogState,
) {
  if (prevState.model !== nextState.model) {
    notifications.error("Change of model is not supported!");
  }

  const operations: Operation[] = [];

  operations.push(modifyClass(entity.id, {
    iri: nextState.iri,
    name: nextState.name,
    description: nextState.description,
  }));

  operations.push(...specializationStateToOperations(entity, prevState, nextState));

  const model = prevState.model.model;
  model.executeOperations(operations);
}
