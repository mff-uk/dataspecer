import { isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { CmeSemanticModel } from "../../dataspecer/cme-model";
import {
  type BaseEntityProfileDialogState,
  createEditBaseEntityProfileDialogState,
  createNewBaseEntityProfileDialogState,
} from "../base-entity-profile/base-entity-profile-dialog-state";
import {
  type BaseRelationshipProfileDialogState,
  createBaseRelationshipProfileDialogState,
} from "../base-relationship-profile/base-relationship-profile-dialog-state";
import {
  type EntityRepresentative,
  filterByModel,
  isRepresentingAssociation,
  listRelationshipProfileDomains,
  type RelationshipRepresentative,
  representOwlThing,
  representRdfsLiteral,
  representRelationshipProfile,
  representRelationships,
  representRelationshipUsages,
  representUndefinedAssociation,
  representUndefinedClassProfile,
  sortRepresentatives,
} from "../utilities/dialog-utilities";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { EntityDsIdentifier } from "../../dataspecer/entity-model";
import { entityModelsMapToCmeSemanticModel } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { configuration, createLogger } from "../../application";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { isSemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { InvalidState } from "../../application/error";
import { getDomainAndRange } from "../../util/relationship-utils";

const LOG = createLogger(import.meta.url);

export interface AssociationProfileDialogState extends
  BaseEntityProfileDialogState<RelationshipRepresentative>,
  BaseRelationshipProfileDialogState<EntityRepresentative> { }

/**
 * State represents a newly created profile for given profiled entity.
 */
export function createNewAssociationProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  profilesIdentifiers: EntityDsIdentifier[],
): AssociationProfileDialogState {

  const allModels = entityModelsMapToCmeSemanticModel(
    graphContext.models, visualModel);

  const noProfile = representUndefinedAssociation();

  const allProfiles = listAssociationsToProfile(
    classesContext, graphContext, allModels);
  sortRepresentatives(language, allProfiles);

  const allDomains = listRelationshipProfileDomains(
    classesContext, graphContext, allModels);
  sortRepresentatives(language, allDomains);

  const allRanges = allDomains;

  const allSpecializations = listAssociationsToSpecialize(
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
    filterByModel, representUndefinedClassProfile());

  const result = {
    ...entityProfileState,
    ...relationshipProfileState,
    isIriAutogenerated: true,
  };

  return configuration().relationshipProfileToIri(result);
}

function listAssociationsToProfile(
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
  ].filter(isRepresentingAssociation);
}

function listAssociationsToSpecialize(
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
  ].filter(isRepresentingAssociation);
}

/**
 * @throws {InvalidState}
 */
export function createEditAssociationProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  model: InMemorySemanticModel,
  entityIdentifier: string,
): AssociationProfileDialogState {
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

  const allProfiles = listAssociationsToProfile(
    classesContext, graphContext, allModels);
  sortRepresentatives(language, allProfiles);

  const allDomains = listRelationshipProfileDomains(
    classesContext, graphContext, allModels);
  sortRepresentatives(language, allDomains);

  const allRanges = allDomains;

  const allSpecializations = listAssociationsToSpecialize(
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
    filterByModel, representUndefinedClassProfile());

  return {
    ...entityProfileState,
    ...relationshipProfileState,
  };

}
