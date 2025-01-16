
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModelRelationship, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";
import { SemanticModelClassUsage, SemanticModelRelationshipUsage, isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { getDomainAndRange } from "../../util/relationship-utils";
import { EditAttributeProfileDialogState } from "./edit-attribute-profile-dialog-controller";
import { EditAttributeProfileDialog } from "./edit-attribute-profile-dialog";
import { DialogWrapper } from "../dialog-api";
import { CmeModel } from "../../dataspecer/cme-model";
import { InvalidAggregation, MissingRelationshipEnds, RuntimeError } from "../../application/error";
import { createRelationshipProfileStateForNew } from "../utilities/relationship-profile-utilities";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { EntityRepresentative, isRepresentingAttribute, RelationshipRepresentative, representClassProfiles, representDataTypes, representOwlThing, representRelationshipProfiles, representRelationships, representUndefinedDataType } from "../utilities/dialog-utilities";
import { createEntityProfileStateForNewEntityProfile, createEntityProfileStateForNewProfileOfProfile } from "../utilities/entity-profile-utilities";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { configuration } from "../../application";

export function createAddAttributeProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  _model: InMemorySemanticModel,
  entity: SemanticModelClassUsage,
): EditAttributeProfileDialogState {
  const entities = graphContext.aggregatorView.getEntities();

  const models = [...graphContext.models.values()];

  const vocabularies = entityModelsMapToCmeVocabulary(graphContext.models, visualModel);

  const profiles = [
    ...representRelationships(models, vocabularies,
      classesContext.relationships),
    ...representRelationshipProfiles(entities, models, vocabularies,
      classesContext.profiles.filter(item => isSemanticModelRelationshipUsage(item))),
  ].filter(isRepresentingAttribute);

  // We just profile the first available attribute.
  const profileOf = profiles[0] ?? null;
  const profileOfEntity = entities[profileOf.identifier]?.aggregatedEntity;

  if (profileOf === null) {
    throw new RuntimeError("There is nothing to profile.");
  }

  const classProfiles = [
    ...representClassProfiles(entities, models, vocabularies,
      classesContext.profiles.filter(item => isSemanticModelClassUsage(item))),
  ];
  const domain = classProfiles.find(item => item.identifier === entity.id) ?? null;

  if (domain === null) {
    throw new RuntimeError("Missing profile domain.");
  }

  // Rest of this function depends of what we are profiling.
  if (isSemanticModelRelationship(profileOfEntity)) {
    return createForAttribute(
      language, vocabularies, profileOfEntity, profiles, profileOf, classProfiles,
      domain);
  } else if (isSemanticModelRelationshipUsage(profileOfEntity)) {
    return createForAttributeProfile(
      language, vocabularies, profileOfEntity, profiles, profileOf, classProfiles,
      entities, domain);
  } else {
    throw new RuntimeError("Invalid profile type.");
  }
}

function createForAttribute(
  language: string,
  vocabularies: CmeModel[],
  entity: SemanticModelRelationship,
  profiles: RelationshipRepresentative[],
  profileOf: RelationshipRepresentative,
  classProfiles: EntityRepresentative[],
  domainConcept: EntityRepresentative,
): EditAttributeProfileDialogState {

  const { domain, range } = getDomainAndRange(entity);
  if (domain === null || range === null) {
    throw new MissingRelationshipEnds(entity);
  }

  // EntityProfileState

  const entityProfileState = createEntityProfileStateForNewEntityProfile(
    language, vocabularies, profiles, profileOf.identifier,
    configuration().nameToIri);

  // RelationshipState<EntityRepresentative>

  const owlThing = representOwlThing();

  const undefinedDataType = representUndefinedDataType();
  const dataTypes = [undefinedDataType, ...representDataTypes()];

  const relationshipProfileState = createRelationshipProfileStateForNew(
    domain.concept, owlThing, domain.cardinality, classProfiles,
    range.concept, undefinedDataType, range.cardinality, dataTypes);

  return {
    enableProfilChange: true,
    ...entityProfileState,
    ...relationshipProfileState,
    domain: domainConcept,
    overrideDomain: true,
  };

}

function createForAttributeProfile(
  language: string,
  vocabularies: CmeModel[],
  entity: SemanticModelRelationshipUsage,
  profiles: RelationshipRepresentative[],
  profileOf: RelationshipRepresentative,
  classProfiles: EntityRepresentative[],
  entities: Record<string, AggregatedEntityWrapper>,
  domainConcept: EntityRepresentative,
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
    language, vocabularies, profiles, profileOf.identifier,
    configuration().nameToIri);

  // RelationshipState<EntityRepresentative>

  const owlThing = representOwlThing();

  const undefinedDataType = representUndefinedDataType();
  const dataTypes = [undefinedDataType, ...representDataTypes()];

  const relationshipProfileState = createRelationshipProfileStateForNew(
    domain.concept, owlThing, domain.cardinality, classProfiles,
    range.concept, undefinedDataType, range.cardinality, dataTypes);

  return {
    enableProfilChange: true,
    ...entityProfileState,
    ...relationshipProfileState,
    domain: domainConcept,
    overrideDomain: true,
  };
}

export const createAddAttributeProfileDialog = (
  state: EditAttributeProfileDialogState,
  onConfirm: (state: EditAttributeProfileDialogState) => void,
): DialogWrapper<EditAttributeProfileDialogState> => {
  return {
    label: "dialog.attribute-profile.label-create",
    component: EditAttributeProfileDialog,
    state,
    confirmLabel: "dialog.attribute-profile.ok-create",
    cancelLabel: "dialog.attribute-profile.cancel",
    validate: () => true,
    onConfirm: onConfirm,
    onClose: null,
  };
}
