import { isWritableVisualModel, VisualModel } from "@dataspecer/core-v2/visual-model";

import { createLogger, Options } from "../application";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { findSourceModelOfEntity } from "../service/model-service";
import { isInMemorySemanticModel } from "../utilities/model";
import { isSemanticModelClass, isSemanticModelRelationship, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage, SemanticModelRelationshipEndUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { EditAttributeDialogState } from "../dialog/attribute/edit-attribute-dialog-controller";
import { createAddAttributeDialog, createAddAttributeDialogState } from "../dialog/attribute/create-add-attribute-dialog-state";
import { createAddAttributeProfileDialog, createAddAttributeProfileDialogState } from "../dialog/attribute-profile/create-add-attribute-profile-dialog-state";
import { EditAttributeProfileDialogState } from "../dialog/attribute-profile/edit-attribute-profile-dialog-controller";
import { EntityModel } from "@dataspecer/core-v2";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createRelationship } from "@dataspecer/core-v2/semantic-model/operations";
import { getDomainAndRange } from "../util/relationship-utils";
import { createRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/operations";
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
) {
  const aggregate = graph.aggregatorView.getEntities()?.[identifier];

  const entity = aggregate.aggregatedEntity;
  if (entity === undefined || entity === null) {
    notifications.error(`Can not find the entity with identifier '${identifier}'.`);
    return;
  }
  const model = findSourceModelOfEntity(entity.id, graph.models);
  if (model === null || !isInMemorySemanticModel(model)) {
    notifications.error("Model is not writable, can not modify entity.");
    return;
  }

  if (isSemanticModelClass(entity)) {
    const onConfirm = (state: EditAttributeDialogState) => {
      const result = createSemanticAttribute(notifications, graph.models, state);
      // TODO PRQuestion: I copy-pasted it - to be constistent with the fact that
      //                  createSemanticAttribute is also copy-pasted
      if(visualModel !== null && isWritableVisualModel(visualModel)) {
        addSemanticAttributeToVisualModelAction(notifications, visualModel, state.domain.identifier, result?.identifier ?? null, null);
      }
    };
    const state = createAddAttributeDialogState(
      classes, graph, visualModel, options.language, model, entity);
    dialogs.openDialog(createAddAttributeDialog(state, onConfirm));
  } else if (isSemanticModelClassUsage(entity)) {
    const onConfirm = (state: EditAttributeProfileDialogState) => {
      const profiled = graph.aggregatorView.getEntities()?.[state.profileOf.identifier]?.aggregatedEntity ?? null;
      if (profiled === null) {
        notifications.error("Entity to profile is not available.");
        return;
      }
      if (isSemanticModelRelationship(profiled) || isSemanticModelRelationshipUsage(profiled)) {
        createRelationshipProfile(state, graph.models, profiled);
      } else {
        notifications.error("Invalid entity to profile.");
      }
    };
    const state = createAddAttributeProfileDialogState(
      classes, graph, visualModel, options.language, model, entity);
    dialogs.openDialog(createAddAttributeProfileDialog(state, onConfirm));
  } else {
    notifications.error("Unknown entity type.");
  }
}

// TODO PRQuestion: Defined on 2 places,
//                  so I guess that there is some intention for this,
//                  since it isn't the first time I see it.
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
      cardinality: state.domainCardinality.cardinality,
    }, {
      name: state.name ?? null,
      description: state.description ?? null,
      concept: state.range.identifier,
      cardinality: state.rangeCardinality.cardinality,
      iri: state.iri,
    }]
  });

  const model: InMemorySemanticModel = models.get(state.model.dsIdentifier) as InMemorySemanticModel;
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

const createRelationshipProfile = (
  state: EditAttributeProfileDialogState,
  models: Map<string, EntityModel>,
  entity: SemanticModelRelationship | SemanticModelRelationshipUsage,
): {
  identifier: string,
  model: InMemorySemanticModel,
} | null => {
  const model: InMemorySemanticModel = models.get(state.model.dsIdentifier) as InMemorySemanticModel;

  const domain = {
    concept: state.overrideDomain ? state.domain.identifier : null,
    name: null,
    description: null,
    cardinality: state.overrideDomainCardinality ? state.domainCardinality.cardinality ?? null : null,
    usageNote: null,
    iri: null,
  } satisfies SemanticModelRelationshipEndUsage;

  const range = {
    concept: state.overrideRange ? state.range.identifier : null,
    name: state.overrideName ? state.name : null,
    description: state.overrideDescription ? state.description : null,
    cardinality: state.overrideRangeCardinality ? state.rangeCardinality.cardinality ?? null : null,
    usageNote: null,
    iri: state.iri,
  } as SemanticModelRelationshipEndUsage;

  // We need to preserve the order of domain and range.
  let ends: SemanticModelRelationshipEndUsage[] | undefined = undefined;
  if (isSemanticModelRelationship(entity)) {
    const domainAndRange = getDomainAndRange(entity);
    if (domainAndRange.domainIndex === 1 && domainAndRange.rangeIndex === 0) {
      ends = [range, domain];
    } else {
      ends = [domain, range];
    }
  } else if (isSemanticModelRelationshipUsage(entity)) {
    const domainAndRange = getDomainAndRange(entity);
    if (domainAndRange.domainIndex === 1 && domainAndRange.rangeIndex === 0) {
      ends = [range, domain];
    } else {
      ends = [domain, range];
    }
  }

  const { success, id: identifier } = model.executeOperation(createRelationshipUsage({
    usageOf: entity.id,
    usageNote: state.usageNote,
    ends: ends,
  }));

  if (identifier !== undefined && success) {
    return { identifier, model: model };
  } else {
    return null;
  }
}