import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { isWritableVisualModel, VisualModel } from "@dataspecer/core-v2/visual-model";

import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { Options, createLogger } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { firstInMemorySemanticModel } from "../utilities/model";
import { CreatedEntityOperationResult, createRelationship } from "@dataspecer/core-v2/semantic-model/operations";
import { createNewAttributeDialog, createNewAttributeDialogState } from "../dialog/attribute/create-new-attribute-dialog-state";
import { EditAttributeDialogState } from "../dialog/attribute/edit-attribute-dialog-controller";
import { EntityModel } from "@dataspecer/core-v2";
import { addSemanticAttributeToVisualModelAction } from "./add-semantic-attribute-to-visual-model";

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

  const onConfirm = (state: EditAttributeDialogState) => {
    const result = createSemanticAttribute(notifications, graph.models, state);
    if(visualModel !== null && isWritableVisualModel(visualModel)) {
      if(result?.identifier !== undefined) {
        addSemanticAttributeToVisualModelAction(
          notifications, visualModel, state.domain.identifier,
          result.identifier, true);
      }
    }
  };

  openCreateAttributeDialog(
    options, dialogs, classes, graph, visualModel, model, onConfirm);
}

function getDefaultModel(graph: ModelGraphContextType): InMemorySemanticModel | null {
  return firstInMemorySemanticModel(graph.models);
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

function openCreateAttributeDialog(
  options: Options,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  visualModel: VisualModel | null,
  model: InMemorySemanticModel,
  onConfirm: (state: EditAttributeDialogState) => void,
) {
  const state = createNewAttributeDialogState(
    classes, graph, visualModel, options.language, model.getId());
  dialogs.openDialog(createNewAttributeDialog(state, onConfirm));
}
