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

export function openCreateProfileDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  useClasses: UseClassesContextType,
  graph: ModelGraphContextType,
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
    saveChanges(useClasses, graph, state);
  };
  dialogs.openDialog(createEntityProfileDialog(
    classes, graph, entity, options.language, onConfirm));
}

const saveChanges = (
  classes: UseClassesContextType,
  graph: ModelGraphContextType,
  state: CreateProfileState,
) => {
  const entity = state.entity;
  if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
    handleSaveClassProfile(classes, graph, state, entity);
  } else if (isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)) {
    handleSaveRelationshipProfile(classes, graph, state, entity);
  }
}

const handleSaveClassProfile = (
  classes: UseClassesContextType,
  graph: ModelGraphContextType,
  state: CreateProfileState,
  entity: SemanticModelClass | SemanticModelClassUsage,
  // model: InMemorySemanticModel,
) => {
  // TODO ACTION Create class entity
  const { id: classUsageId } = classes.createClassEntityUsage(state.model, entity.type[0], {
    usageOf: entity.id,
    usageNote: state.usageNote,
    description: state.overriddenFields.description && state.changedFields.description ? state.description : null,
    name: state.overriddenFields.name && state.changedFields.name ? state.name : null,
    iri: state.iri,
  });

  // TODO Add profile to the canvas.
  // const visualModel = graph.aggregatorView.getActiveVisualModel();
  // if (classUsageId && isWritableVisualModel(visualModel)) {
  //   actions.addNodeToVisualModel(model.getId(), classUsageId);
  // }
};

const handleSaveRelationshipProfile = (
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

  // TODO Add profile to the canvas.
  // const visualModel = graph.aggregatorView.getActiveVisualModel();
  // if (relationshipUsageId && isWritableVisualModel(visualModel)) {
  //   visualModel.addVisualRelationship({
  //     model: state.model.getId(),
  //     representedRelationship: relationshipUsageId,
  //     waypoints: [],
  //   });
  // }

};
