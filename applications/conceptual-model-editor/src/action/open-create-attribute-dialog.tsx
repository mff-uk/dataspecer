import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { VisualModel } from "@dataspecer/core-v2/visual-model";

import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { Options, createLogger } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { firstInMemorySemanticModel } from "../utilities/model";
import { createCreateAttributeDialog } from "../dialog/attribute/edit-attribute-dialog";
import { createRelationship } from "@dataspecer/core-v2/semantic-model/operations";
import { createNewAttributeDialogState } from "../dialog/attribute/create-new-attribute-dialog-state";
import { CreateAttributeDialogState } from "../dialog/attribute/edit-attribute-dialog-controller";

const LOG = createLogger(import.meta.url);

/**
 * Open and handle create attribute dialog.
 */
export function openCreateAttributeDialogAction(
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

  const onConfirm = (state: CreateAttributeDialogState) => {
    // Create attribute.
    createSemanticAttribute(notifications, state);
  };

  openCreateAttributeDialog(
    options, dialogs, classes, graph, visualModel, model, onConfirm);
}

function getDefaultModel(graph: ModelGraphContextType): InMemorySemanticModel | null {
  return firstInMemorySemanticModel(graph.models);
}

function createSemanticAttribute(
  notifications: UseNotificationServiceWriterType,
  state: CreateAttributeDialogState): {
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
  const newAttribute = model.executeOperation(operation);
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

function openCreateAttributeDialog(
  options: Options,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  visualModel: VisualModel | null,
  model: InMemorySemanticModel,
  onConfirm: (state: CreateAttributeDialogState) => void,
) {
  const state = createNewAttributeDialogState(
    classes, graph, visualModel, options.language, model);
  dialogs.openDialog(createCreateAttributeDialog(state, onConfirm));
}
