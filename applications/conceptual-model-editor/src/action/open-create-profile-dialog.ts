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
import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";

import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { Options } from "../application/options";
import { ClassesContextType, UseClassesContextType } from "../context/classes-context";
import { createEntityProfileDialog, CreateProfileState } from "../dialog/obsolete/create-profile-dialog";
import { addSemanticClassProfileToVisualModelAction } from "./add-class-profile-to-visual-model";
import { UseDiagramType } from "../diagram/diagram-hook";
import { getDomainAndRange } from "../util/relationship-utils";
import { addSemanticRelationshipProfileToVisualModelAction } from "./add-relationship-profile-to-visual-model";

export function openCreateProfileDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  useClasses: UseClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  diagram: UseDiagramType,
  position: { x: number, y: number },
  identifier: string,
) {
  const entity = graph.aggregatorView.getEntities()?.[identifier].rawEntity;
  if (entity === undefined) {
    notifications.error(`Can not find the entity with identifier '${identifier}'.`);
    return;
  }
  //
  if (isSemanticModelClass(entity)) {
    dialogs.openDialog(createEntityProfileDialog(
      classes, graph, entity, options.language, (state) => {
        saveChanges(notifications, useClasses, graph,
          visualModel, diagram, state, position);
      }));
  } else if (isSemanticModelClassUsage(entity)) {
    dialogs.openDialog(createEntityProfileDialog(
      classes, graph, entity, options.language, (state) => {
        saveChanges(notifications, useClasses, graph,
          visualModel, diagram, state, position);
      }));
  } else if (isSemanticModelAttribute(entity)) {
    dialogs.openDialog(createEntityProfileDialog(
      classes, graph, entity, options.language, (state) => {
        saveChanges(notifications, useClasses, graph,
          visualModel, diagram, state, position);
      }));
  } else if (isSemanticModelAttributeUsage(entity)) {
    dialogs.openDialog(createEntityProfileDialog(
      classes, graph, entity, options.language, (state) => {
        saveChanges(notifications, useClasses, graph,
          visualModel, diagram, state, position);
      }));
  } else if (isSemanticModelRelationship(entity)) {
    dialogs.openDialog(createEntityProfileDialog(
      classes, graph, entity, options.language, (state) => {
        saveChanges(notifications, useClasses, graph,
          visualModel, diagram, state, position);
      }));
  } else if (isSemanticModelRelationshipUsage(entity)) {
    dialogs.openDialog(createEntityProfileDialog(
      classes, graph, entity, options.language, (state) => {
        saveChanges(notifications, useClasses, graph,
          visualModel, diagram, state, position);
      }));
  } else if (isSemanticModelGeneralization(entity)) {
    notifications.error(`Generalization modification is not supported!`);
  } else {
    notifications.error(`Unknown entity type.`);
  }
}

const saveChanges = (
  notifications: UseNotificationServiceWriterType,
  classes: UseClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  diagram: UseDiagramType,
  state: CreateProfileState,
  position: { x: number, y: number },
) => {
  const entity = state.entity;
  if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
    handleSaveClassProfile(
      notifications, classes, graph, visualModel, diagram, state, entity, position);
  } else if (isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)) {
    handleSaveRelationshipProfile(notifications, classes, graph, visualModel, state, entity);
  }
}

const handleSaveClassProfile = (
  notifications: UseNotificationServiceWriterType,
  classes: UseClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  diagram: UseDiagramType,
  state: CreateProfileState,
  entity: SemanticModelClass | SemanticModelClassUsage,
  position: { x: number, y: number },
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
    addSemanticClassProfileToVisualModelAction(
      notifications, graph, visualModel, diagram,
      classUsageId, state.model.getId(), position);
  }
};

const handleSaveRelationshipProfile = (
  notifications: UseNotificationServiceWriterType,
  classes: UseClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
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

  let ends: SemanticModelRelationshipEndUsage[] | undefined = undefined;
  if (isSemanticModelRelationship(entity)) {
    const domainAndRange = getDomainAndRange(entity);
    if (domainAndRange.domainIndex == 1 && domainAndRange.rangeIndex == 0) {
      ends = [rangeEnd, domainEnd];
    } else {
      ends = [domainEnd, rangeEnd];
    }
  } else if (isSemanticModelRelationshipUsage(entity)) {
    const domainAndRange = getDomainAndRange(entity);
    if (domainAndRange.domainIndex == 1 && domainAndRange.rangeIndex == 0) {
      ends = [rangeEnd, domainEnd];
    } else {
      ends = [domainEnd, rangeEnd];
    }
  }

  const { id: relationshipUsageId } = classes.createRelationshipEntityUsage(state.model, entity.type[0], {
    usageOf: entity.id,
    usageNote: state.usageNote,
    ends: ends,
  });

  // Add profile to the canvas.
  if (relationshipUsageId !== undefined) {
    addSemanticRelationshipProfileToVisualModelAction(
      notifications, graph, visualModel,
      relationshipUsageId, state.model.getId());
  }
};
