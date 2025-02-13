import {
  isSemanticModelAttribute,
  isSemanticModelClass,
  isSemanticModelGeneralization,
  isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
  SemanticModelRelationshipUsage,
  isSemanticModelAttributeUsage,
  isSemanticModelClassUsage,
  isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { Options } from "../application/options";
import { ClassesContextType, UseClassesContextType } from "../context/classes-context";
import { findSourceModelOfEntity } from "../service/model-service";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { isInMemorySemanticModel } from "../utilities/model";
import { openEditAssociationDialogAction } from "./open-edit-association-dialog";
import { openEditAssociationProfileDialogAction } from "./open-edit-association-profile-dialog";
import { openEditAttributeDialogAction } from "./open-edit-attribute-dialog";
import { openEditAttributeProfileDialogAction } from "./open-edit-attribute-profile-dialog";
import { openEditClassDialogAction } from "./open-edit-class-dialog";
import { openEditClassProfileDialogAction } from "./open-edit-class-profile-dialog";
import { createLogger } from "../application";
import { isSemanticModelClassProfile, isSemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { isSemanticModelAttributeProfile } from "../dataspecer/semantic-model";

const LOG = createLogger(import.meta.url);

export function openModifyDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  _useClasses: UseClassesContextType,
  graph: ModelGraphContextType,
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

  // In future we should have different dialogs based on the type, for now
  // we just fall through to a single dialog for all.
  if (isSemanticModelClass(entity)) {
    openEditClassDialogAction(
      options, dialogs, classes, graph, notifications, visualModel, model,
      entity);
    return;
  } else if (isSemanticModelClassUsage(entity)
    || isSemanticModelClassProfile(entity)) {
    openEditClassProfileDialogAction(
      options, dialogs, classes, graph, notifications, visualModel, model,
      entity);
    return;
  } else if (isSemanticModelAttribute(entity)) {
    openEditAttributeDialogAction(
      options, dialogs, classes, graph, notifications, visualModel, model,
      entity);
    return;
  } else if (isSemanticModelAttributeUsage(entity)
    || isSemanticModelAttributeProfile(entity)) {
    openEditAttributeProfileDialogAction(
      options, dialogs, classes, graph, notifications, visualModel, model,
      aggregate.rawEntity as SemanticModelRelationshipUsage);
    return;
  } else if (isSemanticModelRelationship(entity)) {
    openEditAssociationDialogAction(
      options, dialogs, classes, graph, notifications, visualModel, model,
      entity);
    return;
  } else if (isSemanticModelRelationshipUsage(entity)
    || isSemanticModelRelationshipProfile(entity)) {
    openEditAssociationProfileDialogAction(
      options, dialogs, classes, graph, notifications, visualModel, model,
      aggregate.rawEntity as SemanticModelRelationshipUsage);
    return;
  } else if (isSemanticModelGeneralization(entity)) {
    notifications.error("Generalization modification is not supported!");
    return;
  } else {
    LOG.error("Can not open modify dialog for unknown entity type.", { entity })
    notifications.error("Unknown entity type.");
    return;
  }
};
