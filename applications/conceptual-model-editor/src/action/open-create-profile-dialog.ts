import {
  isSemanticModelAttribute,
  isSemanticModelClass,
  isSemanticModelGeneralization,
  isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
  isSemanticModelAttributeUsage,
  isSemanticModelClassUsage,
  isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { WritableVisualModel, isWritableVisualModel } from "@dataspecer/core-v2/visual-model";

import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { Options } from "../configuration/options";
import { ClassesContextType } from "../context/classes-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { addSemanticRelationshipProfileToVisualModelAction } from "./add-relationship-profile-to-visual-model";
import { EditAssociationProfileDialogState } from "../dialog/association-profile/edit-association-profile-dialog-controller";
import { EditAttributeProfileDialogState } from "../dialog/attribute-profile/edit-attribute-profile-dialog-controller";
import { addSemanticClassProfileToVisualModelAction } from "./add-class-profile-to-visual-model";
import { createNewAssociationProfileDialog, createNewAssociationProfileDialogState } from "../dialog/association-profile/create-new-association-profile-dialog-state";
import { createEditAttributeProfileDialog, createNewAttributeProfileDialogState } from "../dialog/attribute-profile/create-new-attribute-profile-dialog-state";
import { EditClassProfileDialogState } from "../dialog/class-profile/edit-class-profile-dialog-controller";
import { createNewClassProfileDialog, createNewProfileClassDialogState } from "../dialog/class-profile/create-new-class-profile-dialog-state";
import { EntityModel } from "@dataspecer/core-v2";
import { createCmeClassProfile } from "../dataspecer/cme-model/operation/create-cme-class-profile";
import { createCmeRelationshipProfile } from "../dataspecer/cme-model/operation/create-cme-relationship-profile";
import { isSemanticModelClassProfile, isSemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { isSemanticModelAttributeProfile } from "../dataspecer/semantic-model";
import { addSemanticAttributeToVisualModelAction } from "./add-semantic-attribute-to-visual-model";
import { createEagerCmeOperationExecutor } from "../dataspecer/cme-model/operation/cme-operation-executor";

export function openCreateProfileDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  diagram: UseDiagramType,
  position: { x: number, y: number },
  identifier: string,
) {
  const entity = graph.aggregatorView.getEntities()?.[identifier].aggregatedEntity;
  if (entity === undefined) {
    notifications.error(`Can not find the entity with identifier '${identifier}'.`);
    return;
  }
  //
  if (isSemanticModelClass(entity)
    || isSemanticModelClassUsage(entity)
    || isSemanticModelClassProfile(entity)) {
    const state = createNewProfileClassDialogState(
      classes, graph, visualModel, options.language, [entity.id]);
    const onConfirm = (state: EditClassProfileDialogState) => {
      const result = createClassProfile(state, graph.models);
      if (isWritableVisualModel(visualModel)) {
        addSemanticClassProfileToVisualModelAction(
          notifications, graph, classes, visualModel, diagram,
          result.identifier, result.model,
          position);
      };
    };
    dialogs.openDialog(createNewClassProfileDialog(state, onConfirm));
    return;
  }

  if (isSemanticModelAttribute(entity)
    || isSemanticModelAttributeUsage(entity)
    || isSemanticModelAttributeProfile(entity)) {
    const state = createNewAttributeProfileDialogState(
      classes, graph, visualModel, options.language, [entity.id]);
    const onConfirm = (state: EditAttributeProfileDialogState) => {
      const result = createRelationshipProfile(state, graph.models);
      if (result?.identifier !== undefined) {
        addSemanticAttributeToVisualModelAction(
          notifications, visualModel, state.domain.identifier,
          result.identifier, null, true);
      }
    };
    dialogs.openDialog(createEditAttributeProfileDialog(state, onConfirm));
    return;
  }

  if (isSemanticModelRelationship(entity)
    || isSemanticModelRelationshipUsage(entity)
    || isSemanticModelRelationshipProfile(entity)) {
    const state = createNewAssociationProfileDialogState(
      classes, graph, visualModel, options.language, [entity.id]);
    const onConfirm = (state: EditAssociationProfileDialogState) => {
      const result = createRelationshipProfile(state, graph.models)
      // Add to visual model if possible.
      if (isWritableVisualModel(visualModel)) {
        addSemanticRelationshipProfileToVisualModelAction(
          notifications, graph, visualModel,
          result.identifier, result.model);
      }
    };
    dialogs.openDialog(createNewAssociationProfileDialog(state, onConfirm));
    return;
  }

  if (isSemanticModelGeneralization(entity)) {
    notifications.error("Generalization modification is not supported!");
    return;
  }

  notifications.error("Unknown entity type.");
}

const createClassProfile = (
  state: EditClassProfileDialogState,
  models: Map<string, EntityModel>,
): {
  identifier: string,
  model: string,
} => {
  const result = createCmeClassProfile(
    createEagerCmeOperationExecutor([...models.values() as any]), {
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
    });
  return {
    identifier: result.identifier,
    model: state.model.dsIdentifier,
  };
}

const createRelationshipProfile = (
  state: EditAttributeProfileDialogState | EditAssociationProfileDialogState,
  models: Map<string, EntityModel>,
): {
  identifier: string,
  model: string,
} => {
  const result = createCmeRelationshipProfile(
    createEagerCmeOperationExecutor([...models.values() as any]), {
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
      domainCardinality:
      state.overrideDomainCardinality ?
        state.domainCardinality.cardinality : null,
      range: state.range.identifier,
      rangeCardinality:
      state.overrideRangeCardinality ?
        state.rangeCardinality.cardinality : null,
    });
  return {
    identifier: result.identifier,
    model: state.model.dsIdentifier,
  };
}
