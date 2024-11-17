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
import { getDomainAndRange } from "../util/relationship-utils";

export function openCreateProfileDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  useClasses: UseClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
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
        createProfileForClass(
          notifications, useClasses, graph, visualModel, state, position);
      }));
  } else if (isSemanticModelClassUsage(entity)) {
    dialogs.openDialog(createEntityProfileDialog(
      classes, graph, entity, options.language, (state) => {
        createProfileForClassProfile(
          notifications, useClasses, graph, visualModel, state, position);
      }));
  } else if (isSemanticModelAttribute(entity)) {
    dialogs.openDialog(createEntityProfileDialog(
      classes, graph, entity, options.language, (state) => {
        createProfileForAttribute(
          notifications, useClasses, graph, visualModel, state);
      }));
  } else if (isSemanticModelAttributeUsage(entity)) {
    dialogs.openDialog(createEntityProfileDialog(
      classes, graph, entity, options.language, (state) => {
        createProfileForAttributeProfile(
          notifications, useClasses, graph, visualModel, state);
      }));
  } else if (isSemanticModelRelationship(entity)) {
    dialogs.openDialog(createEntityProfileDialog(
      classes, graph, entity, options.language, (state) => {
        createProfileForRelationship(
          notifications, useClasses, graph, visualModel, state);
      }));
  } else if (isSemanticModelRelationshipUsage(entity)) {
    dialogs.openDialog(createEntityProfileDialog(
      classes, graph, entity, options.language, (state) => {
        createProfileForRelationshipProfile(
          notifications, useClasses, graph, visualModel, state);
      }));
  } else if (isSemanticModelGeneralization(entity)) {
    notifications.error(`Generalization modification is not supported!`);
  } else {
    notifications.error(`Unknown entity type.`);
  }
}

const createProfileForClass = (
  notifications: UseNotificationServiceWriterType,
  classes: UseClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  state: CreateProfileState,
  position: { x: number, y: number },
) => {

}

const createProfileForClassProfile = (
  notifications: UseNotificationServiceWriterType,
  classes: UseClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  state: CreateProfileState,
  position: { x: number, y: number },
) => {

}

const createProfileForAttribute = (
  notifications: UseNotificationServiceWriterType,
  classes: UseClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  state: CreateProfileState,
) => {

}

const createProfileForAttributeProfile = (
  notifications: UseNotificationServiceWriterType,
  classes: UseClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  state: CreateProfileState,
) => {

}

const createProfileForRelationship = (
  notifications: UseNotificationServiceWriterType,
  classes: UseClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  state: CreateProfileState,
) => {

}

const createProfileForRelationshipProfile = (
  notifications: UseNotificationServiceWriterType,
  classes: UseClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  state: CreateProfileState,
) => {

}

/*

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

  let ends: SemanticModelRelationshipEndUsage[];
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
    ends: ends!,
  });

  // Add profile to the canvas.
  if (relationshipUsageId !== undefined) {
    addRelationToVisualModelAction(
      notifications, graph, state.model.getId(),
      relationshipUsageId);
  }
};

*/
