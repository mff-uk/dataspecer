import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { EntityModel } from "@dataspecer/core-v2";
import { SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { Options } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { createEditClassProfileDialog, createEditClassProfileDialogState } from "../dialog/class-profile/create-edit-class-profile-dialog-state";
import { EditClassProfileDialogState } from "../dialog/class-profile/edit-class-profile-dialog-controller";
import { SemanticModelClassProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { modifyCmeClassProfile } from "../dataspecer/cme-model/operation/modify-cmd-class-profile";

export function openEditClassProfileDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  notifications: UseNotificationServiceWriterType,
  visualModel: VisualModel | null,
  model: InMemorySemanticModel,
  entity: SemanticModelClassUsage | SemanticModelClassProfile,
) {
  const state = createEditClassProfileDialogState(
    classes, graph, visualModel, options.language, model, entity.id);

  const onConfirm = (nextState: EditClassProfileDialogState) => {
    updateSemanticClassProfile(notifications, entity, graph.models, state, nextState);
  };

  dialogs.openDialog(createEditClassProfileDialog(state, onConfirm));
}

function updateSemanticClassProfile(
  notifications: UseNotificationServiceWriterType,
  entity: SemanticModelClassUsage | SemanticModelClassProfile,
  models: Map<string, EntityModel>,
  prevState: EditClassProfileDialogState,
  state: EditClassProfileDialogState,
) {
  if (prevState.model !== state.model) {
    notifications.error("Change of model is not supported!");
    return;
  }

  modifyCmeClassProfile({
    identifier: entity.id,
    model: state.model.dsIdentifier,
    profileOf: state.profileOf.map(item => item.identifier),
    iri: state.iri,
    name: state.name,
    nameSource: state.overrideName ? null :
      state.nameSource?.identifier ?? null,
    description: state.description,
    descriptionSource: state.overrideDescription ? null :
      state.descriptionSourceValue?.identifier ?? null,
    usageNote: state.usageNote,
    usageNoteSource: state.overrideUsageNote ? null :
      state.usageNoteSource?.identifier ?? null,
  }, [...models.values() as any]);
}
