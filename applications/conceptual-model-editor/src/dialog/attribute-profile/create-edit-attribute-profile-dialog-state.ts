
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { getDomainAndRange } from "../../util/relationship-utils";
import { EditAttributeProfileDialogState } from "./edit-attribute-profile-dialog-controller";
import { createRelationshipProfileStateForEdit } from "../utilities/relationship-profile-utilities";
import { createEntityProfileStateForEdit } from "../utilities/entity-profile-utilities";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { InvalidAggregation, MissingEntity, MissingRelationshipEnds } from "../../application/error";
import { DialogWrapper } from "../dialog-api";
import { EditAttributeProfileDialog } from "./edit-attribute-profile-dialog";
import { listDataTypes, representUndefinedDataType, listClassProfiles } from "../utilities/dialog-utilities";
import { listAttributesToProfile } from "./attribute-profile-utilities";

/**
 * State represents edit of existing entity
 */
export function createEditAttributeProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  model: InMemorySemanticModel,
  entityIdentifier: string,
): EditAttributeProfileDialogState {
  const entities = graphContext.aggregatorView.getEntities();
  const { rawEntity: entity, aggregatedEntity: aggregated } = entities[entityIdentifier];
  if (entity === null) {
    throw new MissingEntity(entityIdentifier);
  }
  if (!isSemanticModelRelationshipUsage(entity) || !isSemanticModelRelationshipUsage(aggregated)) {
    throw new InvalidAggregation(entity.id, aggregated);
  }

  //

  const vocabularies = entityModelsMapToCmeVocabulary(
    graphContext.models, visualModel);

  const availableProfiles = listAttributesToProfile(
    classesContext, graphContext, vocabularies);

  const { domain, range } = getDomainAndRange(entity);
  const { domain: aggregatedDomain, range: aggregatedRange } = getDomainAndRange(aggregated);
  if (domain === null || range === null || aggregatedDomain === null || aggregatedRange === null) {
    throw new MissingRelationshipEnds(entity);
  }

  // EntityProfileState

  const entityProfileState = createEntityProfileStateForEdit(
    language, vocabularies, model.getId(),
    availableProfiles, [entity.usageOf], range.iri ?? "",
    entity.name, entity.name === null ? entity.usageOf : null,
    entity.description, entity.description === null ? entity.usageOf : null,
    entity.usageNote, entity.usageNote === null ? entity.usageOf : null);

  // RelationshipState<EntityRepresentative>

  const classProfiles = listClassProfiles(classesContext, graphContext, vocabularies);

  const defaultRange = representUndefinedDataType();

  const relationshipProfileState = createRelationshipProfileStateForEdit(
    availableProfiles, [entity.usageOf],
    domain.concept, entity.usageOf,
    domain.cardinality, entity.usageOf,
    classProfiles,
    range.concept, entity.usageOf, defaultRange,
    range.cardinality, entity.usageOf, listDataTypes());

  return {
    ...entityProfileState,
    ...relationshipProfileState,
  };
}

export const createEditAttributeProfileDialog = (
  state: EditAttributeProfileDialogState,
  onConfirm: (state: EditAttributeProfileDialogState) => void,
): DialogWrapper<EditAttributeProfileDialogState> => {
  return {
    label: "dialog.attribute-profile.label-edit",
    component: EditAttributeProfileDialog,
    state,
    confirmLabel: "dialog.attribute-profile.ok-edit",
    cancelLabel: "dialog.attribute-profile.cancel",
    validate: () => true,
    onConfirm: onConfirm,
    onClose: null,
  };
}
