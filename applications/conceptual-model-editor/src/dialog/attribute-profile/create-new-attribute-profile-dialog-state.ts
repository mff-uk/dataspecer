
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModelRelationship, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";
import { SemanticModelRelationshipUsage, isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { getDomainAndRange } from "../../util/relationship-utils";
import { EditAttributeProfileDialogState } from "./edit-attribute-profile-dialog-controller";
import { EditAttributeProfileDialog } from "./edit-attribute-profile-dialog";
import { DialogWrapper } from "../dialog-api";
import { CmeModel } from "../../dataspecer/cme-model";
import { InvalidAggregation, MissingEntity, MissingRelationshipEnds } from "../../application/error";
import { createRelationshipProfileStateForNew } from "../utilities/relationship-profile-utilities";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { EntityRepresentative, RelationshipRepresentative, representClassProfiles, representDataTypes, representOwlThing, representRelationshipProfiles, representRelationships, representUndefinedDataType } from "../utilities/dialog-utilities";
import { createEntityProfileStateForNewEntityProfile, createEntityProfileStateForNewProfileOfProfile } from "../utilities/entity-profile-utilities";

/**
 * @param classesContext
 * @param graphContext
 * @param visualModel
 * @param language
 * @param entity Raw entity to create profile for.
 * @returns
 */
export function createNewAttributeProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  entity: SemanticModelRelationship | SemanticModelRelationshipUsage,
): EditAttributeProfileDialogState {
  const entities = graphContext.aggregatorView.getEntities();

  const models = [...graphContext.models.values()];

  const vocabularies = entityModelsMapToCmeVocabulary(graphContext.models, visualModel);

  const profiles = [
    ...representRelationships(models, vocabularies,
      classesContext.relationships),
    ...representRelationshipProfiles(entities, models, vocabularies,
      classesContext.profiles.filter(item => isSemanticModelRelationshipUsage(item))),
  ];

  // Find representation of entity to profile.
  const profileOf = profiles.find(item => item.identifier === entity.id)
    ?? profiles[0]
    ?? null;

  if (profileOf === null) {
    throw new MissingEntity(entity.id);
  }

  const classProfiles = [
    ...representClassProfiles(entities, models, vocabularies,
      classesContext.profiles.filter(item => isSemanticModelClassUsage(item))),
  ];

  // Rest of this function depends of what we are profiling.
  if (isSemanticModelRelationship(entity)) {
    return createForAttribute(
      language, vocabularies, entity, profiles, profileOf, classProfiles);
  } else {
    return createForAttributeProfile(
      language, vocabularies, entity, profiles, profileOf, classProfiles, entities);
  }
}

function createForAttribute(
  language: string,
  vocabularies: CmeModel[],
  entity: SemanticModelRelationship,
  profiles: RelationshipRepresentative[],
  profileOf: RelationshipRepresentative,
  classProfiles: EntityRepresentative[],
): EditAttributeProfileDialogState {

  const { domain, range } = getDomainAndRange(entity);
  if (domain === null || range === null) {
    throw new MissingRelationshipEnds(entity);
  }

  // EntityProfileState

  const entityProfileState = createEntityProfileStateForNewEntityProfile(
    language, vocabularies, profiles, profileOf.identifier);

  // RelationshipState<EntityRepresentative>

  const owlThing = representOwlThing();

  const undefinedDataType = representUndefinedDataType();
  const dataTypes = [undefinedDataType, ...representDataTypes()];

  const relationshipProfileState = createRelationshipProfileStateForNew(
    domain.concept, owlThing, domain.cardinality, classProfiles,
    range.concept, undefinedDataType, range.cardinality, dataTypes);

  return {
    ...entityProfileState,
    ...relationshipProfileState,
  };

}

function createForAttributeProfile(
  language: string,
  vocabularies: CmeModel[],
  entity: SemanticModelRelationshipUsage,
  profiles: RelationshipRepresentative[],
  profileOf: RelationshipRepresentative,
  classProfiles: EntityRepresentative[],
  entities: Record<string, AggregatedEntityWrapper>
): EditAttributeProfileDialogState {
  const aggregated = entities[entity.id]?.aggregatedEntity;
  if (!isSemanticModelRelationshipUsage(aggregated)) {
    throw new InvalidAggregation(entity, null);
  }

  const { domain, range } = getDomainAndRange(aggregated);
  if (domain === null || range === null) {
    throw new MissingRelationshipEnds(entity);
  }

  // EntityProfileState

  const entityProfileState = createEntityProfileStateForNewProfileOfProfile(
    language, vocabularies, profiles, profileOf.identifier);

  // RelationshipState<EntityRepresentative>

  const owlThing = representOwlThing();

  const undefinedDataType = representUndefinedDataType();
  const dataTypes = [undefinedDataType, ...representDataTypes()];

  const relationshipProfileState = createRelationshipProfileStateForNew(
    domain.concept, owlThing, domain.cardinality, classProfiles,
    range.concept, undefinedDataType, range.cardinality, dataTypes);

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
