import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { Operation } from "@dataspecer/core-v2/semantic-model/operations";
import { modifyRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/operations";
import { EntityModel } from "@dataspecer/core-v2";

import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { Options } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { mergeEndsUpdate } from "./utilities/operations-utilities";
import { SemanticModelRelationshipEndUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { EditAssociationProfileDialogState } from "../dialog/association-profile/edit-association-profile-dialog-controller";
import { createEditAssociationProfileDialog, createEditAssociationProfileDialogState } from "../dialog/association-profile/create-edit-association-profile-dialog-state";

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
  entity: SemanticModelRelationshipUsage,
) {
  const state = createEditAssociationProfileDialogState(
    classes, graph, visualModel, options.language, model, entity);

  const onConfirm = (nextState: EditAssociationProfileDialogState) => {
    updateSemanticAssociationProfile(notifications, graph.models, entity, state, nextState);
  };

  dialogs.openDialog(createEditAssociationProfileDialog(state, onConfirm));
}

type SemanticModelRelationshipChange = Partial<Omit<SemanticModelRelationshipEndUsage, "type" | "id">>;

function updateSemanticAssociationProfile(
  notifications: UseNotificationServiceWriterType,
  models: Map<string, EntityModel>,
  entity: SemanticModelRelationshipUsage,
  prevState: EditAssociationProfileDialogState,
  nextState: EditAssociationProfileDialogState,
) {
  if (prevState.model !== nextState.model) {
    notifications.error("Change of model is not supported!");
  }

  const operations: Operation[] = [];

  const nextDomain: SemanticModelRelationshipChange = {};
  if (prevState.domain !== nextState.domain
    || prevState.overrideDomain !== nextState.overrideDomain) {
    nextDomain.concept = nextState.overrideDomain ? nextState.domain.identifier : null;
  }
  if (prevState.domainCardinality !== nextState.domainCardinality
    || prevState.overrideDomainCardinality !== nextState.overrideDomainCardinality) {
    nextDomain.cardinality = nextState.overrideDomainCardinality ? nextState.domainCardinality.cardinality : null;
  }

  const nextRange: SemanticModelRelationshipChange = {};
  if (prevState.iri !== nextState.iri) {
    nextRange.iri = nextState.iri;
  }
  if (prevState.name !== nextState.name
    || prevState.overrideName !== nextState.overrideName) {
    nextRange.name = nextState.overrideName ? nextState.name : null;
  }
  if (prevState.description !== nextState.description
    || prevState.overrideDescription !== nextState.overrideDescription) {
    nextRange.description = nextState.overrideDescription ? nextState.description : null;
  }
  if (prevState.range !== nextState.range
    || prevState.overrideRange !== nextState.overrideRange) {
    nextRange.concept = nextState.overrideRange ? nextState.range.identifier : null;
  }
  if (prevState.rangeCardinality !== nextState.rangeCardinality
    || prevState.overrideRangeCardinality !== nextState.overrideRangeCardinality) {
    nextRange.cardinality = nextState.overrideRangeCardinality ? nextState.rangeCardinality.cardinality : null;
  }

  const ends = mergeEndsUpdate(entity, nextDomain, nextRange);
  operations.push(modifyRelationshipUsage(entity.id, { ends }));

  const model: InMemorySemanticModel = models.get(nextState.model.dsIdentifier) as InMemorySemanticModel;
  model.executeOperations(operations);
}
