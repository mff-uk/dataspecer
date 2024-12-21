
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { isSemanticModelRelationship, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditAssociationProfileDialogState } from "./edit-association-profile-dialog-controller";
import { EntityRepresentative, RelationshipRepresentative, representClassProfiles, representOwlThing, representRelationshipProfiles, representRelationships } from "../utilities/dialog-utilities";
import { getDomainAndRange } from "../../util/relationship-utils";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { InvalidAggregation, MissingEntity, MissingRelationshipEnds } from "../../application/error";
import { CmeModel } from "../../dataspecer/cme-model";
import { createRelationshipProfileStateForNew } from "../utilities/relationship-profile-utilities";
import { EditAssociationProfileDialog } from "./edit-association-profile-dialog";
import { DialogWrapper } from "../dialog-api";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";
import { createEntityProfileStateForNew } from "../utilities/entity-profile-utilities";

/**
 * @param classesContext
 * @param graphContext
 * @param visualModel
 * @param language
 * @param entity Raw entity to create profile for.
 * @returns
 */
export function createNewAssociationProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  entity: SemanticModelRelationship | SemanticModelRelationshipUsage,
): EditAssociationProfileDialogState {
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
    return createForAssociation(
      language, vocabularies, entity, profiles, profileOf, classProfiles);
  } else {
    return createForAssociationProfile(
      language, vocabularies, entity, profiles, profileOf, classProfiles, entities);
  }
}

function createForAssociation(
  language: string,
  vocabularies: CmeModel[],
  entity: SemanticModelRelationship,
  profiles: RelationshipRepresentative[],
  profileOf: RelationshipRepresentative,
  classProfiles: EntityRepresentative[],
): EditAssociationProfileDialogState {

  const { domain, range } = getDomainAndRange(entity);
  if (domain === null || range === null) {
    throw new MissingRelationshipEnds(entity);
  }

  // EntityProfileState

  const entityProfileState = createEntityProfileStateForNew(
    language, vocabularies, profiles, profileOf.identifier);

  // RelationshipState<EntityRepresentative>

  const owlThing = representOwlThing();

  const relationshipProfileState = createRelationshipProfileStateForNew(
    domain.concept, owlThing, domain.cardinality, classProfiles,
    range.concept, owlThing, range.cardinality, classProfiles);

  return {
    ...entityProfileState,
    ...relationshipProfileState,
  };

}

function createForAssociationProfile(
  language: string,
  vocabularies: CmeModel[],
  entity: SemanticModelRelationshipUsage,
  profiles: RelationshipRepresentative[],
  profileOf: RelationshipRepresentative,
  classProfiles: EntityRepresentative[],
  entities: Record<string, AggregatedEntityWrapper>
): EditAssociationProfileDialogState {
  const aggregated = entities[entity.id]?.aggregatedEntity;
  if (!isSemanticModelRelationshipUsage(aggregated)) {
    throw new InvalidAggregation(entity, null);
  }

  const { domain, range } = getDomainAndRange(aggregated);
  if (domain === null || range === null) {
    throw new MissingRelationshipEnds(entity);
  }

  // EntityProfileState

  const entityProfileState = createEntityProfileStateForNew(
    language, vocabularies, profiles, profileOf.identifier);

  // RelationshipState<EntityRepresentative>

  const owlThing = representOwlThing();

  const relationshipProfileState = createRelationshipProfileStateForNew(
    domain.concept, owlThing, domain.cardinality, classProfiles,
    range.concept, owlThing, range.cardinality, classProfiles);

  return {
    ...entityProfileState,
    ...relationshipProfileState,
  };
}

export const createNewAssociationProfileDialog = (
  state: EditAssociationProfileDialogState,
  onConfirm: (state: EditAssociationProfileDialogState) => void,
): DialogWrapper<EditAssociationProfileDialogState> => {
  return {
    label: "create-association-profile-dialog.label",
    component: EditAssociationProfileDialog,
    state,
    confirmLabel: "create-dialog.btn-ok",
    cancelLabel: "create-profile-dialog.btn-close",
    validate: () => true,
    onConfirm: onConfirm,
    onClose: null,
  };
}

