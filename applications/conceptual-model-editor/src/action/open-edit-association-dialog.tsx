import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { VisualModel } from "@dataspecer/core-v2/visual-model";

import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { Options } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { createEditAssociationDialog } from "../dialog/association/edit-association-dialog";
import { modifyRelation, Operation } from "@dataspecer/core-v2/semantic-model/operations";
import { EditAssociationDialogState } from "../dialog/association/edit-association-dialog-controller";
import { SemanticModelRelationship, SemanticModelRelationshipEnd } from "@dataspecer/core-v2/semantic-model/concepts";
import { createEditAssociationDialogState } from "../dialog/association/create-edit-association-dialog-state";
import { mergeEndsUpdate, specializationStateToOperations } from "./utilities/operations-utilities";

/**
 * Open and handle edit association dialog.
 */
export function openEditAssociationDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  notifications: UseNotificationServiceWriterType,
  visualModel: VisualModel | null,
  model: InMemorySemanticModel,
  entity: SemanticModelRelationship,
) {
  const state = createEditAssociationDialogState(
    classes, graph, visualModel, options.language, model, entity);

  const onConfirm = (nextState: EditAssociationDialogState) => {
    updateSemanticAssociation(notifications, entity, state, nextState);
  };

  dialogs.openDialog(createEditAssociationDialog(state, onConfirm));
}

type SemanticModelRelationshipChange = Partial<Omit<SemanticModelRelationshipEnd, "type" | "id">>;

function updateSemanticAssociation(
  notifications: UseNotificationServiceWriterType,
  entity: SemanticModelRelationship,
  prevState: EditAssociationDialogState,
  nextState: EditAssociationDialogState,
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
  console.log(">", { nextDomain, nextRange, ends });
  operations.push(modifyRelation(entity.id, { ends }));
  operations.push(...specializationStateToOperations(entity, prevState, nextState));

  const model = prevState.model.model;
  model.executeOperations(operations);
}
