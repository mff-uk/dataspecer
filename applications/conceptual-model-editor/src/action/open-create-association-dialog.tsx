import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { isWritableVisualModel, VisualModel } from "@dataspecer/core-v2/visual-model";

import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { Options, createLogger } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { firstInMemorySemanticModel } from "../utilities/model";
import { CreateAssociationDialogState, createCreateAssociationDialogState } from "../dialog/association/create-association-dialog-controller";
import { createCreateAssociationDialog } from "../dialog/association/create-association-dialog";
import { createRelationship } from "@dataspecer/core-v2/semantic-model/operations";
import { addSemanticRelationshipToVisualModelAction } from "./add-relationship-to-visual-model";

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

  const model = defaultModel ?? getDefaultModel(graph);
  if (model === null) {
    notifications.error("You have to create a writable vocabulary first!");
    return;
  }

  const onConfirm = (state: CreateAssociationDialogState) => {
    // Create association.
    const createResult = createSemanticAssociation(notifications, state);
    if (createResult === null) {
      return;
    }
    // Add to visual model if possible.
    if (isWritableVisualModel(visualModel)) {
      const source = visualModel.getVisualEntityForRepresented(state.domain.identifier);
      const target = visualModel.getVisualEntityForRepresented(state.range.identifier);
      if (source !== null && target !== null) {
        // Both ends are in the visual model.
        addSemanticRelationshipToVisualModelAction(
          notifications, graph, visualModel,
          createResult.identifier, createResult.model.getId());
      }
    }
  };

  openCreateAssociationDialog(
    options, dialogs, classes, graph, visualModel, model, onConfirm);
}

function getDefaultModel(graph: ModelGraphContextType): InMemorySemanticModel | null {
  return firstInMemorySemanticModel(graph.models);
}

function createSemanticAssociation(
  notifications: UseNotificationServiceWriterType,
  state: CreateAssociationDialogState): {
    identifier: string,
    model: InMemorySemanticModel
  } | null {

  const operation = createRelationship({
    ends: [{
      iri: null,
      name: {},
      description: {},
      concept: state.domain.identifier,
      cardinality: state.domainCardinality.cardinality,
    }, {
      name: state.name ?? null,
      description: state.description ?? null,
      concept: state.range.identifier,
      cardinality: state.rangeCardinality.cardinality,
      iri: state.iri,
    }]
  });

  const model: InMemorySemanticModel = state.model.model;
  const newAssociation = model.executeOperation(operation);
  if (newAssociation.success === false || newAssociation.id === undefined) {
    notifications.error("We have not received the id of newly created association. See logs for more detail.");
    LOG.error("We have not received the id of newly association class.", { "operation": newAssociation });
    return null;
  }

  return {
    identifier: newAssociation.id,
    model,
  };
}

function openCreateAssociationDialog(
  options: Options,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  visualModel: VisualModel | null,
  model: InMemorySemanticModel,
  onConfirm: (state: CreateAssociationDialogState) => void,
) {
  const state = createCreateAssociationDialogState(
    classes, graph, visualModel, options.language, model);
  dialogs.openDialog(createCreateAssociationDialog(state, onConfirm));
}
