import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { EntityModel } from "@dataspecer/core-v2";
import { SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { Options } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { EditAssociationProfileDialogState } from "../dialog/association-profile/edit-association-profile-dialog-controller";
import { createEditAssociationProfileDialog, createEditAssociationProfileDialogState } from "../dialog/association-profile/create-edit-association-profile-dialog-state";
import { modifyCmeRelationshipProfile } from "../dataspecer/cme-model/operation/modify-cme-relationship-profile";
import { SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";

/**
 * Open and handle edit association dialog.
 */
export function openEditAssociationProfileDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  notifications: UseNotificationServiceWriterType,
  visualModel: VisualModel | null,
  model: InMemorySemanticModel,
  entity: SemanticModelRelationshipUsage | SemanticModelRelationshipProfile,
) {
  const state = createEditAssociationProfileDialogState(
    classes, graph, visualModel, options.language, model, entity.id);

  const onConfirm = (nextState: EditAssociationProfileDialogState) => {
    updateSemanticAssociationProfile(notifications, graph.models, entity, state, nextState);
  };

  dialogs.openDialog(createEditAssociationProfileDialog(state, onConfirm));
}

function updateSemanticAssociationProfile(
  notifications: UseNotificationServiceWriterType,
  models: Map<string, EntityModel>,
  entity: SemanticModelRelationshipUsage | SemanticModelRelationshipProfile,
  prevState: EditAssociationProfileDialogState,
  state: EditAssociationProfileDialogState,
) {
  if (prevState.model !== state.model) {
    notifications.error("Change of model is not supported!");
  }

  modifyCmeRelationshipProfile({
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
    //
    domain: state.domain.identifier,
    domainCardinality: state.domainCardinality.cardinality,
    range: state.range.identifier,
    rangeCardinality: state.rangeCardinality.cardinality,
  }, [...models.values() as any]);
}
