import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { VisualModel, isWritableVisualModel } from "@dataspecer/core-v2/visual-model";

import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { Options, createLogger } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { firstInMemorySemanticModel } from "../utilities/model";
import { CreatedEntityOperationResult, createGeneralization, createRelationship } from "@dataspecer/core-v2/semantic-model/operations";
import { addSemanticRelationshipToVisualModelAction } from "./add-relationship-to-visual-model";
import { createCreateAssociationDialogState, createNewAssociationDialog } from "../dialog/association/create-new-association-dialog-state";
import { EditAssociationDialogState } from "../dialog/association/edit-association-dialog-controller";
import { EntityModel } from "@dataspecer/core-v2";
import { CreatedSemanticEntityData } from "./open-create-class-dialog";

const LOG = createLogger(import.meta.url);

/**
 * Open and handle create association dialog.
 */
export function openCreateAssociationDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  notifications: UseNotificationServiceWriterType,
  visualModel: VisualModel | null,
  defaultModel: InMemorySemanticModel | null,
) {

  const model = defaultModel ?? firstInMemorySemanticModel(graph.models);
  if (model === null) {
    notifications.error("You have to create a writable vocabulary first!");
    return;
  }

  const state = createCreateAssociationDialogState(
    classes, graph, visualModel, options.language, model.getId());

  const onConfirm = (state: EditAssociationDialogState) => {
    createSemanticAssociation(notifications, visualModel, graph, state, true);
  };

  dialogs.openDialog(createNewAssociationDialog(state, onConfirm));
}

export function createSemanticAssociation(
  notifications: UseNotificationServiceWriterType,
  visualModel: VisualModel | null,
  graph: ModelGraphContextType,
  state: EditAssociationDialogState,
  shouldAddToVisualModel: boolean,
) {
  // Create association.
  const createResult = createSemanticAssociationInternal(notifications, graph.models, state);
  if (createResult === null) {
    return;
  }
  if(shouldAddToVisualModel) {
    // Add to visual model if possible.
    if (isWritableVisualModel(visualModel)) {
      const sources = visualModel.getVisualEntitiesForRepresented(state.domain.identifier);
      const targets = visualModel.getVisualEntitiesForRepresented(state.range.identifier);
      if (sources !== null && targets !== null) {
        // Both ends are in the visual model with at least one node.
        addSemanticRelationshipToVisualModelAction(
          notifications, graph, visualModel,
          createResult.identifier, createResult.model.getId());
      }
    }
  }
}

export function createSemanticAssociationInternal(
  notifications: UseNotificationServiceWriterType,
  models: Map<string, EntityModel>,
  state: EditAssociationDialogState
): CreatedSemanticEntityData | null {

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
  const newAssociation = model.executeOperation(operation) as CreatedEntityOperationResult;
  if (newAssociation.success === false || newAssociation.id === undefined) {
    notifications.error("We have not received the id of newly created association. See logs for more detail.");
    LOG.error("We have not received the id of newly association class.", { "operation": newAssociation });
    return null;
  }

  // Perform additional modifications for which we need to have the class identifier.
  const operations = [];
  for (const specialization of state.specializations) {
    operations.push(createGeneralization({
      parent: specialization.specialized,
      child: newAssociation.id,
      iri: specialization.iri,
    }));
  }
  model.executeOperations(operations);

  return {
    identifier: newAssociation.id,
    model,
  };
}
