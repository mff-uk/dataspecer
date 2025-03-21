import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import {
  DataTypeRepresentative,
  filterByModel,
  isRepresentingAttribute,
  listAttributeProfileRanges,
  listRelationshipProfileDomains,
  RelationshipRepresentative,
  representOwlThing,
  representRdfsLiteral,
  representRelationshipProfile,
  representRelationships,
  representRelationshipUsages,
  representUndefinedAssociation,
  representUndefinedAttribute,
  representUndefinedClassProfile,
  representUndefinedDataType,
  sortRepresentatives,
} from "../utilities/dialog-utilities";
import { entityModelsMapToCmeSemanticModel } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { configuration, createLogger } from "../../application";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { getDomainAndRange } from "../../util/relationship-utils";
import { BaseEntityProfileDialogState, createEditBaseEntityProfileDialogState, createNewBaseEntityProfileDialogState } from "../base-entity-profile/base-entity-profile-dialog-state";
import { BaseRelationshipProfileDialogState, createBaseRelationshipProfileDialogState } from "../base-relationship-profile/base-relationship-profile-dialog-state";
import { EntityDsIdentifier } from "../../dataspecer/entity-model";
import { isSemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { InvalidState } from "../../application/error";
import { CmeSemanticModel } from "../../dataspecer/cme-model";
import { isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

const LOG = createLogger(import.meta.url);

export interface AttributeProfileDialogState extends
  BaseEntityProfileDialogState<RelationshipRepresentative>,
  BaseRelationshipProfileDialogState<DataTypeRepresentative> { }

/**
 * State represents a newly created profile for given profiled entity.
 */
export function createNewAttributeProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  profilesIdentifiers: EntityDsIdentifier[],
): AttributeProfileDialogState {

  const allModels = entityModelsMapToCmeSemanticModel(
    graphContext.models, visualModel);

  const noProfile = representUndefinedAttribute();

  const allProfiles = listAttributesToProfile(
    classesContext, graphContext, allModels);
  sortRepresentatives(language, allProfiles);

  const allDomains = listRelationshipProfileDomains(
    classesContext, graphContext, allModels);
  sortRepresentatives(language, allDomains);

  const allRanges = listAttributeProfileRanges();

  const allSpecializations = listAttributesToSpecialize(
    classesContext, graphContext, allModels);

  // EntityProfileState

  const entityProfileState = createNewBaseEntityProfileDialogState(
    language, configuration().languagePreferences,
    allModels,
    allProfiles, profilesIdentifiers, noProfile, allSpecializations,
    configuration().relationshipNameToIri);

  // RelationshipState<EntityRepresentative>

  const profile = entityProfileState.profiles[0];
  const relationshipProfileState = createBaseRelationshipProfileDialogState(
    entityProfileState.model,
    allModels,
    profile.domain, profile.domainCardinality.cardinality, allDomains,
    filterByModel, representUndefinedClassProfile(),
    profile.range, profile.rangeCardinality.cardinality, allRanges,
    items => items, representUndefinedDataType());

  const result = {
    ...entityProfileState,
    ...relationshipProfileState,
    isIriAutogenerated: true,
  };
  return configuration().relationshipProfileToIri(result);
}

/**
 * State represents edit of existing entity
 * @throws InvalidState
 */
export function createEditAttributeProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  model: InMemorySemanticModel,
  entityIdentifier: string,
): AttributeProfileDialogState {
  const entities = graphContext.aggregatorView.getEntities();

  const { rawEntity: entity, aggregatedEntity: aggregate } =
    entities[entityIdentifier];

  if (!isSemanticModelRelationshipProfile(entity)
    || !isSemanticModelRelationshipProfile(aggregate)) {
    LOG.error("Entity is not of expected type.", { entity, aggregate });
    throw new InvalidState();
  }

  const { domain, range } = getDomainAndRange(entity);

  const { domain: aggregatedDomain, range: aggregatedRange } =
    getDomainAndRange(aggregate);

  if (domain === null || range === null
    || aggregatedDomain === null || aggregatedRange === null) {
    LOG.error("Entity has invalid ends.",
      { domain, range, aggregatedDomain, aggregatedRange });
    throw new InvalidState();
  }

  //

  const allModels = entityModelsMapToCmeSemanticModel(
    graphContext.models, visualModel);

  const noProfile = representUndefinedAssociation();

  const allProfiles = listAttributesToProfile(
    classesContext, graphContext, allModels);
  sortRepresentatives(language, allProfiles);

  const allDomains = listRelationshipProfileDomains(
    classesContext, graphContext, allModels);
  sortRepresentatives(language, allDomains);

  const allRanges = listAttributeProfileRanges();

  const allSpecializations = listAttributesToSpecialize(
    classesContext, graphContext, allModels);

  // EntityProfileState

  const entityProfileState = createEditBaseEntityProfileDialogState(
    language, graphContext.models, allModels,
     { identifier: entity.id, model: model.getId() },
    allProfiles, range.profiling, noProfile, range.iri ?? "",
    range.name, range.nameFromProfiled,
    range.description, range.descriptionFromProfiled,
    range.usageNote, range.usageNoteFromProfiled,
    allSpecializations);

  // RelationshipState<EntityRepresentative>

  const relationshipProfileState = createBaseRelationshipProfileDialogState(
    entityProfileState.model,
    allModels,
    domain.concept, domain.cardinality, allDomains,
    filterByModel, representUndefinedClassProfile(),
    range.concept, range.cardinality, allRanges,
    filterByModel, representUndefinedDataType());

  return {
    ...entityProfileState,
    ...relationshipProfileState,
  };

}

function listAttributesToProfile(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  vocabularies: CmeSemanticModel[],
) {
  const entities = graphContext.aggregatorView.getEntities();
  const models = [...graphContext.models.values()];

  const owlThing = representOwlThing();

  const rdfsLiteral = representRdfsLiteral();

  return [
    ...representRelationships(models, vocabularies,
      classesContext.relationships,
      owlThing.identifier, rdfsLiteral.identifier),
    ...representRelationshipUsages(entities, models, vocabularies,
      classesContext.usages.filter(item => isSemanticModelRelationshipUsage(item)),
      owlThing.identifier, rdfsLiteral.identifier),
    ...representRelationshipProfile(entities, models, vocabularies,
      classesContext.relationshipProfiles)
  ].filter(isRepresentingAttribute);
}

function listAttributesToSpecialize(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  vocabularies: CmeSemanticModel[],
) {
  const entities = graphContext.aggregatorView.getEntities();
  const models = [...graphContext.models.values()];

  const owlThing = representOwlThing();

  const rdfsLiteral = representRdfsLiteral();

  return [
    ...representRelationshipUsages(entities, models, vocabularies,
      classesContext.usages.filter(item => isSemanticModelRelationshipUsage(item)),
      owlThing.identifier, rdfsLiteral.identifier),
    ...representRelationshipProfile(entities, models, vocabularies,
      classesContext.relationshipProfiles)
  ].filter(isRepresentingAttribute);
}


export function createAddAttributeProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  domainIdentifier: EntityDsIdentifier,
): AttributeProfileDialogState {
  const allModels = entityModelsMapToCmeSemanticModel(
    graphContext.models, visualModel);

  const noProfile = representUndefinedAttribute();

  const allProfiles = listAttributesToProfile(
    classesContext, graphContext, allModels);
  sortRepresentatives(language, allProfiles);

  const allDomains = listRelationshipProfileDomains(
    classesContext, graphContext, allModels);
  sortRepresentatives(language, allDomains);

  const allRanges = listAttributeProfileRanges();

  // EntityProfileState

  const entityProfileState = createNewBaseEntityProfileDialogState(
    language, configuration().languagePreferences,
    allModels,
    allProfiles, [], noProfile, allProfiles,
    configuration().relationshipNameToIri);

  // RelationshipState<EntityRepresentative>

  const profile = entityProfileState.profiles[0];
  const relationshipProfileState = createBaseRelationshipProfileDialogState(
    entityProfileState.model, allModels,
    domainIdentifier, profile.domainCardinality.cardinality, allDomains,
    filterByModel, representUndefinedClassProfile(),
    profile.range, profile.rangeCardinality.cardinality, allRanges,
    items => items, representUndefinedDataType());

  const result = {
    ...entityProfileState,
    ...relationshipProfileState,
    isIriAutogenerated: true,
  };
  return configuration().relationshipProfileToIri(result);
}
