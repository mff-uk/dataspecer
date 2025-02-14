import { isWritableVisualModel, VisualModel } from "@dataspecer/core-v2/visual-model";

import { createLogger, Options } from "../application";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { EditAttributeDialogState } from "../dialog/attribute/edit-attribute-dialog-controller";
import { createAddAttributeDialog, createAddAttributeDialogState } from "../dialog/attribute/create-add-attribute-dialog-state";
import { createAddAttributeProfileDialog, createAddAttributeProfileDialogState } from "../dialog/attribute-profile/create-add-attribute-profile-dialog-state";
import { EditAttributeProfileDialogState } from "../dialog/attribute-profile/edit-attribute-profile-dialog-controller";
import { EntityModel } from "@dataspecer/core-v2";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { CreatedEntityOperationResult, createRelationship } from "@dataspecer/core-v2/semantic-model/operations";
import { createCmeRelationshipProfile } from "../dataspecer/cme-model/operation/create-cme-relationship-profile";
import { EditAssociationProfileDialogState } from "../dialog/association-profile/edit-association-profile-dialog-controller";
import { isSemanticModelClassProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { addSemanticAttributeToVisualModelAction } from "./add-semantic-attribute-to-visual-model";

const LOG = createLogger(import.meta.url);

/**
 * Open and handle create attribute dialog for a node.
 */
export function openCreateAttributeForEntityDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  notifications: UseNotificationServiceWriterType,
  visualModel: VisualModel | null,
  identifier: string,
  onConfirmCallback: ((state: EditAttributeDialogState | EditAttributeProfileDialogState, createdAttributeIdentifier: string) => void) | null,
) {
  const aggregate = graph.aggregatorView.getEntities()?.[identifier];

  const entity = aggregate.aggregatedEntity;
  if (entity === undefined || entity === null) {
    notifications.error(`Can not find the entity with identifier '${identifier}'.`);
    return;
  }

  if (isSemanticModelClass(entity)) {
    const onConfirm = (state: EditAttributeDialogState) => {
      const result = createSemanticAttribute(notifications, graph.models, state);
      if(visualModel !== null && isWritableVisualModel(visualModel)) {
        if(result?.identifier !== undefined) {
          addSemanticAttributeToVisualModelAction(
            notifications, visualModel, state.domain.identifier,
            result.identifier, null);
        }
      }

      if(onConfirmCallback !== null) {
        if(result !== null) {
          onConfirmCallback(state, result.identifier);
        }
      }
    };
    const state = createAddAttributeDialogState(
      classes, graph, visualModel, options.language, entity);
    dialogs.openDialog(createAddAttributeDialog(state, onConfirm));
  } else if (isSemanticModelClassUsage(entity)
    || isSemanticModelClassProfile(entity)) {
    const onConfirm = (state: EditAttributeProfileDialogState) => {
      const result = createRelationshipProfile(state, graph.models);
      if(onConfirmCallback !== null) {
        if(result !== null) {
          onConfirmCallback(state, result.identifier);
        }
      }
    };
    const state = createAddAttributeProfileDialogState(
      classes, graph, visualModel, options.language, identifier);
    dialogs.openDialog(createAddAttributeProfileDialog(state, onConfirm));
  } else {
    LOG.error("Unknown entity type.", { entity });
    notifications.error("Unknown entity type.");
  }

}

function createSemanticAttribute(
  notifications: UseNotificationServiceWriterType,
  models: Map<string, EntityModel>,
  state: EditAttributeDialogState): {
    identifier: string,
    model: InMemorySemanticModel
  } | null {

  const operation = createRelationship({
    ends: [{
      iri: null,
      name: {},
      description: {},
      concept: state.domain.identifier,
      cardinality: state.domainCardinality.cardinality ?? undefined,
    }, {
      name: state.name ?? null,
      description: state.description ?? null,
      concept: state.range.identifier,
      cardinality: state.rangeCardinality.cardinality ?? undefined,
      iri: state.iri,
    }]
  });

  const model: InMemorySemanticModel = models.get(state.model.dsIdentifier) as InMemorySemanticModel;
  const newAttribute = model.executeOperation(operation) as CreatedEntityOperationResult;
  if (newAttribute.success === false || newAttribute.id === undefined) {
    notifications.error("We have not received the id of newly created attribute. See logs for more detail.");
    LOG.error("We have not received the id of newly attribute class.", { "operation": newAttribute });
    return null;
  }

  return {
    identifier: newAttribute.id,
    model,
  };
}

const createRelationshipProfile = (
  state: EditAttributeProfileDialogState | EditAssociationProfileDialogState,
  models: Map<string, EntityModel>,
): {
  identifier: string,
  model: InMemorySemanticModel,
} | null => {
  const model: InMemorySemanticModel = models.get(state.model.dsIdentifier) as InMemorySemanticModel;
  const result = createCmeRelationshipProfile({
    model: state.model.dsIdentifier,
    profileOf: state.profiles.map(item => item.identifier),
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
    //
    domain: state.domain.identifier,
    domainCardinality: state.domainCardinality.cardinality,
    range: state.range.identifier,
    rangeCardinality: state.rangeCardinality.cardinality,
  }, [...models.values() as any]);
  return {
    identifier: result.identifier,
    model,
  };
}
