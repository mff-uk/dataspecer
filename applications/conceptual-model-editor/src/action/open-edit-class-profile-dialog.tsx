import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { isWritableVisualModel, VisualModel } from "@dataspecer/core-v2/visual-model";
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
import { updateVisualNodeProfiles } from "../dataspecer/visual-model/operation/update-visual-node-profiles";

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
    // We need to update visual model: profiles
    if (isWritableVisualModel(visualModel)) {
      updateVisualNodeProfiles(
        visualModel, {
          identifier: entity.id,
          model: model.getId(),
        },
        state.profiles.map(item => ({
          identifier: item.identifier,
          model: item.vocabularyDsIdentifier})),
        nextState.profiles.map(item => ({
          identifier: item.identifier,
          model: item.vocabularyDsIdentifier})));
    }
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
    profileOf: state.profiles.map(item => item.identifier),
    iri: state.iri,
    name: state.name,
    nameSource: state.overrideName ? null :
      state.nameSource.identifier ?? null,
    description: state.description,
    descriptionSource: state.overrideDescription ? null :
      state.descriptionSource.identifier ?? null,
    usageNote: state.usageNote,
    usageNoteSource: state.overrideUsageNote ? null :
      state.usageNoteSource.identifier ?? null,
  }, [...models.values() as any]);
}
