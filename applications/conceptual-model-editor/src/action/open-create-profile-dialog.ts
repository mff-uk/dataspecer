import {
  isSemanticModelAttribute,
  isSemanticModelClass,
  isSemanticModelGeneralization,
  isSemanticModelRelationship,
  SemanticModelClass,
  SemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
  isSemanticModelAttributeUsage,
  isSemanticModelClassUsage,
  isSemanticModelRelationshipUsage,
  SemanticModelClassUsage,
  SemanticModelRelationshipEndUsage,
  SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { Options } from "../application/options";
import { ClassesContextType, UseClassesContextType } from "../context/classes-context";
import { createEntityProfileDialog, CreateProfileState } from "../dialog/obsolete/create-profile-dialog";
import { temporaryDomainRangeHelper } from "../util/relationship-utils";
import { addNodeToVisualModelAction } from "./add-node-to-visual-model";
import { addRelationToVisualModelAction } from "./add-relation-to-visual-model";

export function openCreateProfileDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  useClasses: UseClassesContextType,
  graph: ModelGraphContextType,
  position: { x: number, y: number },
  identifier: string,
) {
  const entity = graph.aggregatorView.getEntities()?.[identifier].rawEntity;
  if (entity === undefined) {
    notifications.error(`Can not find the entity with identifier '${identifier}'.`);
    return;
  }
  // In future we should have different dialogs based on the type, for now
  // we just fall through to a single dialog for all.
  if (isSemanticModelClass(entity)) {

  } else if (isSemanticModelClassUsage(entity)) {

  } else if (isSemanticModelAttribute(entity)) {

  } else if (isSemanticModelAttributeUsage(entity)) {

  } else if (isSemanticModelRelationship(entity)) {

  } else if (isSemanticModelRelationshipUsage(entity)) {

  } else if (isSemanticModelGeneralization(entity)) {
    notifications.error(`Generalization modification is not supported!`);
    return;
  } else {
    notifications.error(`Unknown entity type.`);
    return;
  }
  //
  const onConfirm = (state: CreateProfileState) => {
    saveChanges(notifications, useClasses, graph, state, position);
  };
  dialogs.openDialog(createEntityProfileDialog(
    classes, graph, entity, options.language, onConfirm));
}

const saveChanges = (
  notifications: UseNotificationServiceWriterType,
  classes: UseClassesContextType,
  graph: ModelGraphContextType,
  state: CreateProfileState,
  position: { x: number, y: number },
) => {
  const entity = state.entity;
  if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
    handleSaveClassProfile(notifications, classes, graph, state, entity, position);
  } else if (isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)) {
    handleSaveRelationshipProfile(notifications, classes, graph, state, entity);
  }
}

const handleSaveClassProfile = (
  notifications: UseNotificationServiceWriterType,
  classes: UseClassesContextType,
  graph: ModelGraphContextType,
  state: CreateProfileState,
  entity: SemanticModelClass | SemanticModelClassUsage,
  position: { x: number, y: number },
  // model: InMemorySemanticModel,
) => {
  // Create class entity
  const { id: classUsageId } = classes.createClassEntityUsage(state.model, entity.type[0], {
    usageOf: entity.id,
    usageNote: state.usageNote,
    description: state.overriddenFields.description && state.changedFields.description ? state.description : null,
    name: state.overriddenFields.name && state.changedFields.name ? state.name : null,
    iri: state.iri,
  });

  // Add profile to the canvas.
  if (classUsageId !== undefined) {
    addNodeToVisualModelAction(
      notifications, graph, state.model.getId(),
      classUsageId, position);
  }
};

const handleSaveRelationshipProfile = (
  notifications: UseNotificationServiceWriterType,
  classes: UseClassesContextType,
  graph: ModelGraphContextType,
  state: CreateProfileState,
  entity: SemanticModelRelationship | SemanticModelRelationshipUsage,
  // model: InMemorySemanticModel,
) => {

  const domainEnd = {
    concept: state.overriddenFields.domain ? state.domain.concept : null,
    name: null,
    description: null,
    cardinality:
    state.overriddenFields.domainCardinality ? state.domain.cardinality ?? null
        : null,
    usageNote: null,
    iri: null,
  } satisfies SemanticModelRelationshipEndUsage;

  const rangeEnd = {
    concept: state.overriddenFields.range ? state.range.concept : null,
    name: state.overriddenFields.name ? name : null,
    description: state.overriddenFields.description ? state.description : null,
    cardinality:
    state.overriddenFields.rangeCardinality ? state.range.cardinality ?? null : null,
    usageNote: null,
    iri: state.iri,
  } as SemanticModelRelationshipEndUsage;

  const currentDomainAndRange =
  isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)
      ? temporaryDomainRangeHelper(entity)
      : null;

  let ends: SemanticModelRelationshipEndUsage[];
  if (currentDomainAndRange?.domainIndex == 1 && currentDomainAndRange.rangeIndex == 0) {
    ends = [rangeEnd, domainEnd];
  } else {
    ends = [domainEnd, rangeEnd];
  }

  const { id: relationshipUsageId } = classes.createRelationshipEntityUsage(state.model, entity.type[0], {
    usageOf: entity.id,
    usageNote: state.usageNote,
    ends: ends,
  });

  // Add profile to the canvas.
  if (relationshipUsageId !== undefined) {
    addRelationToVisualModelAction(
      notifications, graph, state.model.getId(),
      relationshipUsageId);
  }
};
