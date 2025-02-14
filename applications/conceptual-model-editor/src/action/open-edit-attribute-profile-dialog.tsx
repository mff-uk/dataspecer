import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { EntityModel } from "@dataspecer/core-v2";

import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { Options } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { EditAttributeProfileDialogState } from "../dialog/attribute-profile/edit-attribute-profile-dialog-controller";
import { createEditAttributeProfileDialog, createEditAttributeProfileDialogState } from "../dialog/attribute-profile/create-edit-attribute-profile-dialog-state";
import { modifyCmeRelationshipProfile } from "../dataspecer/cme-model/operation/modify-cme-relationship-profile";
import { SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";

/**
 * Open and handle edit Attribute dialog.
 */
export function openEditAttributeProfileDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  notifications: UseNotificationServiceWriterType,
  visualModel: VisualModel | null,
  model: InMemorySemanticModel,
  entity: SemanticModelRelationshipUsage | SemanticModelRelationshipProfile,
) {
  const state = createEditAttributeProfileDialogState(
    classes, graph, visualModel, options.language, model, entity.id);

  const onConfirm = (nextState: EditAttributeProfileDialogState) => {
    updateSemanticAttributeProfile(notifications, graph.models, entity, state, nextState);
  };

  dialogs.openDialog(createEditAttributeProfileDialog(state, onConfirm));
}

function updateSemanticAttributeProfile(
  notifications: UseNotificationServiceWriterType,
  models: Map<string, EntityModel>,
  entity: SemanticModelRelationshipUsage | SemanticModelRelationshipProfile,
  prevState: EditAttributeProfileDialogState,
  state: EditAttributeProfileDialogState,
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
