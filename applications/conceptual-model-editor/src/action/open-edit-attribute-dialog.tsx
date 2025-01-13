import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { VisualModel } from "@dataspecer/core-v2/visual-model";

import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { Options } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { Operation, modifyRelation } from "@dataspecer/core-v2/semantic-model/operations";
import { SemanticModelRelationship, SemanticModelRelationshipEnd } from "@dataspecer/core-v2/semantic-model/concepts";
import { mergeEndsUpdate, specializationStateToOperations } from "./utilities/operations-utilities";
import { createEditAttributeDialog, createEditAttributeDialogState } from "../dialog/attribute/create-edit-attribute-dialog-state";
import { EditAttributeDialogState } from "../dialog/attribute/edit-attribute-dialog-controller";
import { EntityModel } from "@dataspecer/core-v2";

/**
 * Open and handle edit Attribute dialog.
 */
export function openEditAttributeDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  notifications: UseNotificationServiceWriterType,
  visualModel: VisualModel | null,
  model: InMemorySemanticModel,
  entity: SemanticModelRelationship,
) {
  const state = createEditAttributeDialogState(
    classes, graph, visualModel, options.language, model, entity);

  const onConfirm = (nextState: EditAttributeDialogState) => {
    updateSemanticAttribute(notifications, graph.models, entity, state, nextState);
  };

  dialogs.openDialog(createEditAttributeDialog(state, onConfirm));
}

type SemanticModelRelationshipChange = Partial<Omit<SemanticModelRelationshipEnd, "type" | "id">>;

function updateSemanticAttribute(
  notifications: UseNotificationServiceWriterType,
  models: Map<string, EntityModel>,
  entity: SemanticModelRelationship,
  prevState: EditAttributeDialogState,
  nextState: EditAttributeDialogState,
) {
  if (prevState.model !== nextState.model) {
    notifications.error("Change of model is not supported!");
  }

  const operations: Operation[] = [];

  const nextDomain: SemanticModelRelationshipChange = {};
  if (prevState.domain !== nextState.domain) {
    nextDomain.concept = nextState.domain.identifier;
  }
  if (prevState.domainCardinality !== nextState.domainCardinality) {
    nextDomain.cardinality = nextState.domainCardinality.cardinality;
  }

  const nextRange: SemanticModelRelationshipChange = {};
  if (prevState.iri !== nextState.iri) {
    nextRange.iri = nextState.iri;
  }
  if (prevState.name !== nextState.name) {
    nextRange.name = nextState.name;
  }
  if (prevState.description !== nextState.description) {
    nextRange.description = nextState.description;
  }
  if (prevState.range !== nextState.range) {
    nextRange.concept = nextState.range.identifier;
  }
  if (prevState.rangeCardinality !== nextState.rangeCardinality) {
    nextRange.cardinality = nextState.rangeCardinality.cardinality;
  }

  const ends = mergeEndsUpdate(entity, nextDomain, nextRange);
  operations.push(modifyRelation(entity.id, { ends }));
  operations.push(...specializationStateToOperations(entity, prevState, nextState));

  const model: InMemorySemanticModel = models.get(nextState.model.dsIdentifier) as InMemorySemanticModel;
  model.executeOperations(operations);
}
