import {
  SemanticModelRelationship,
  isSemanticModelAttribute,
  isSemanticModelClass,
  isSemanticModelGeneralization,
  isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
  SemanticModelRelationshipEndUsage,
  SemanticModelRelationshipUsage,
  isSemanticModelAttributeUsage,
  isSemanticModelClassUsage,
  isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { WritableVisualModel, isWritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createClassUsage, createRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/operations";

import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { Options } from "../application/options";
import { ClassesContextType } from "../context/classes-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { getDomainAndRange } from "../util/relationship-utils";
import { addSemanticRelationshipProfileToVisualModelAction } from "./add-relationship-profile-to-visual-model";
import { EditAssociationProfileDialogState } from "../dialog/association-profile/edit-association-profile-dialog-controller";
import { EditAttributeProfileDialogState } from "../dialog/attribute-profile/edit-attribute-profile-dialog-controller";
import { addSemanticClassProfileToVisualModelAction } from "./add-class-profile-to-visual-model";
import { createNewAssociationProfileDialog, createNewAssociationProfileDialogState } from "../dialog/association-profile/create-new-association-profile-dialog-state";
import { createEditAttributeProfileDialog, createNewAttributeProfileDialogState } from "../dialog/attribute-profile/create-new-attribute-profile-dialog-state";
import { EditClassProfileDialogState } from "../dialog/class-profile/edit-class-profile-dialog-controller";
import { createNewClassProfileDialog, createNewProfileClassDialogState } from "../dialog/class-profile/create-new-class-profile-dialog-state";
import { EntityModel } from "@dataspecer/core-v2";

export function openCreateProfileDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  diagram: UseDiagramType,
  position: { x: number, y: number },
  identifier: string,
) {
  const entity = graph.aggregatorView.getEntities()?.[identifier].aggregatedEntity;
  if (entity === undefined) {
    notifications.error(`Can not find the entity with identifier '${identifier}'.`);
    return;
  }
  //
  if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
    const state = createNewProfileClassDialogState(
      classes, graph, visualModel, options.language, entity);
    const onConfirm = (state: EditClassProfileDialogState) => {
      const createResult = createClassProfile(state, graph.models);
      if (createResult === null) {
        return;
      }
      // Add to visual model if possible.
      if (isWritableVisualModel(visualModel)) {
        addSemanticClassProfileToVisualModelAction(
          notifications, graph, classes, visualModel, diagram,
          createResult.identifier, createResult.model.getId(),
          position);
      }
    };
    dialogs.openDialog(createNewClassProfileDialog(state, onConfirm));
    return;
  }

  if (isSemanticModelAttribute(entity) || isSemanticModelAttributeUsage(entity)) {
    const state = createNewAttributeProfileDialogState(
      classes, graph, visualModel, options.language, entity);
    const onConfirm = (state: EditAttributeProfileDialogState) => {
      createRelationshipProfile(state, graph.models, entity);
      // We do not update visual model here as attribute is part of  a class.
    };
    dialogs.openDialog(createEditAttributeProfileDialog(state, onConfirm));
    return;
  }

  if (isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)) {
    const state = createNewAssociationProfileDialogState(
      classes, graph, visualModel, options.language, entity);
    const onConfirm = (state: EditAssociationProfileDialogState) => {
      const createResult = createRelationshipProfile(state, graph.models, entity);
      if (createResult === null) {
        return;
      }
      // Add to visual model if possible.
      if (isWritableVisualModel(visualModel)) {
        addSemanticRelationshipProfileToVisualModelAction(
          notifications, graph, visualModel,
          createResult.identifier, createResult.model.getId());
      }
    };
    dialogs.openDialog(createNewAssociationProfileDialog(state, onConfirm));
    return;
  }

  if (isSemanticModelGeneralization(entity)) {
    notifications.error("Generalization modification is not supported!");
    return;
  }

  notifications.error("Unknown entity type.");
}

// TODO PeSk: This should not be exported, move to Dataspecer layer.
export const createClassProfile = (
  state: EditClassProfileDialogState,
  models: Map<string, EntityModel>,
): {
  identifier: string,
  model: InMemorySemanticModel,
} | null => {
  const model: InMemorySemanticModel = models.get(state.model.dsIdentifier) as InMemorySemanticModel;

  const { success, id: identifier } = model.executeOperation(createClassUsage({
    usageOf: state.profileOf.identifier,
    iri: state.iri,
    name: state.overrideName ? state.name : null,
    description: state.overrideDescription ? state.description : null,
    usageNote: state.overrideUsageNote ? state.usageNote : null,
  }));

  if (identifier !== undefined && success) {
    return { identifier, model: model };
  } else {
    return null;
  }
}

const createRelationshipProfile = (
  state: EditAttributeProfileDialogState | EditAssociationProfileDialogState,
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
