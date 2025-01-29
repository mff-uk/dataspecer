import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { Operation } from "@dataspecer/core-v2/semantic-model/operations";
import { modifyClassUsage } from "@dataspecer/core-v2/semantic-model/usage/operations";
import { EntityModel } from "@dataspecer/core-v2";
import { SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { Options } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { createEditClassProfileDialog, createEditClassProfileDialogState } from "../dialog/class-profile/create-edit-class-profile-dialog-state";
import { EditClassProfileDialogState } from "../dialog/class-profile/edit-class-profile-dialog-controller";

export function openEditClassProfileDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  notifications: UseNotificationServiceWriterType,
  visualModel: VisualModel | null,
  model: InMemorySemanticModel,
  entity: SemanticModelClassUsage,
) {
  const state = createEditClassProfileDialogState(
    classes, graph, visualModel, options.language, model, entity.id);

  const onConfirm = (nextState: EditClassProfileDialogState) => {
    updateSemanticClassProfile(notifications, entity, graph.models, state, nextState);
  };

  dialogs.openDialog(createEditClassProfileDialog(state, onConfirm));
}

type SemanticModelClassProfileChange = Partial<Omit<SemanticModelClassUsage, "type" | "id">>;

function updateSemanticClassProfile(
  notifications: UseNotificationServiceWriterType,
  entity: SemanticModelClassUsage,
  models: Map<string, EntityModel>,
  prevState: EditClassProfileDialogState,
  nextState: EditClassProfileDialogState,
) {
  if (prevState.model !== nextState.model) {
    notifications.error("Change of model is not supported!");
  }

  const operations: Operation[] = [];

  const nextClass: SemanticModelClassProfileChange =  {};
  if (prevState.iri !== nextState.iri) {
    nextClass.iri = nextState.iri;
  }
  if (prevState.name !== nextState.name
    || prevState.overrideName !== nextState.overrideName) {
    nextClass.name = nextState.overrideName ? nextState.name : null;
  }
  if (prevState.description !== nextState.description
    || prevState.overrideDescription !== nextState.overrideDescription) {
    nextClass.description = nextState.overrideDescription ? nextState.description : null;
  }

  operations.push(modifyClassUsage(entity.id, nextClass));

  const model: InMemorySemanticModel = models.get(nextState.model.dsIdentifier) as InMemorySemanticModel;
  model.executeOperations(operations);
}
