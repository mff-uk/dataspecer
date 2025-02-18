import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { isSemanticModelRelationshipUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { isSemanticModelRelationshipProfile, SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { getDomainAndRange } from "../../util/relationship-utils";
import { EditAttributeProfileDialogState } from "./edit-attribute-profile-dialog-controller";
import { createRelationshipProfileStateForEdit } from "../utilities/relationship-profile-utilities";
import { createEntityProfileStateForEdit } from "../utilities/entity-profile-utilities";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { MissingRelationshipEnds, RuntimeError } from "../../application/error";
import { DialogWrapper } from "../dialog-api";
import { EditAttributeProfileDialog } from "./edit-attribute-profile-dialog";
import { listAttributeProfileRanges, listRelationshipProfileDomains, representOwlThing, representRdfsLiteral, representUndefinedAttribute, sortRepresentatives,} from "../utilities/dialog-utilities";
import { listAttributesToProfile } from "./attribute-profile-utilities";
import { createLogger } from "../../application";

const LOG = createLogger(import.meta.url);

/**
 * State represents edit of existing entity
 *
 * @throws RuntimeError
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

  const {rawEntity: entity, aggregatedEntity: aggregate} = entities[entityIdentifier];

  if (isSemanticModelRelationshipUsage(entity)
    && isSemanticModelRelationshipUsage(aggregate)) {
    return createEditAttributeProfileDialogStateFromUsage(
      classesContext, graphContext, visualModel, language, model,
      entity, aggregate);
  } else if (isSemanticModelRelationshipProfile(entity)
    && isSemanticModelRelationshipProfile(aggregate)) {
    return createEditAttributeProfileDialogStateFromProfile(
      classesContext, graphContext, visualModel, language, model,
      entity, aggregate);
  } else {
    LOG.invalidEntity(entityIdentifier, "Invalid type.", {entity, aggregate});
    throw new RuntimeError("Invalid entity type.");
  }
}

export function createEditAttributeProfileDialogStateFromUsage(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  model: InMemorySemanticModel,
  entity: SemanticModelRelationshipUsage,
  aggregate: SemanticModelRelationshipUsage,
): EditAttributeProfileDialogState {

  const vocabularies = entityModelsMapToCmeVocabulary(
    graphContext.models, visualModel);

  const noProfile = representUndefinedAttribute();

  const availableProfiles = listAttributesToProfile(
    classesContext, graphContext, vocabularies);
  sortRepresentatives(language, availableProfiles);

  const domains = listRelationshipProfileDomains(
    classesContext, graphContext, vocabularies);
  sortRepresentatives(language, domains);

  const ranges = listAttributeProfileRanges();

  const { domain, range } = getDomainAndRange(entity);

  const { domain: aggregatedDomain, range: aggregatedRange } = getDomainAndRange(aggregate);

  if (domain === null || range === null || aggregatedDomain === null || aggregatedRange === null) {
    throw new MissingRelationshipEnds(entity);
  }

  const owlThing = representOwlThing();

  const rdfsLiteral = representRdfsLiteral();

  // EntityProfileState

  const entityProfileState = createEntityProfileStateForEdit(
    language, vocabularies, model.getId(),
    availableProfiles, [entity.usageOf], noProfile, range.iri ?? "",
    entity.name, entity.name === null ? entity.usageOf : null,
    entity.description, entity.description === null ? entity.usageOf : null,
    entity.usageNote, entity.usageNote === null ? entity.usageOf : null);

  // RelationshipState<EntityRepresentative>

  const relationshipProfileState = createRelationshipProfileStateForEdit(
    domain.concept ?? owlThing.identifier, domains, domain.cardinality,
    range.concept ?? rdfsLiteral.identifier, ranges, range.cardinality);

  return {
    ...entityProfileState,
    ...relationshipProfileState,
  };
}

export function createEditAttributeProfileDialogStateFromProfile(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  model: InMemorySemanticModel,
  entity: SemanticModelRelationshipProfile,
  aggregate: SemanticModelRelationshipProfile,
): EditAttributeProfileDialogState {

  const vocabularies = entityModelsMapToCmeVocabulary(
    graphContext.models, visualModel);

  const noProfile = representUndefinedAttribute();

  const availableProfiles = listAttributesToProfile(
    classesContext, graphContext, vocabularies);

  const domains = listRelationshipProfileDomains(
    classesContext, graphContext, vocabularies);

  const ranges = listAttributeProfileRanges();

  const { domain, range } = getDomainAndRange(entity);

  const { domain: aggregatedDomain, range: aggregatedRange } = getDomainAndRange(aggregate);

  if (domain === null || range === null || aggregatedDomain === null || aggregatedRange === null) {
    throw new MissingRelationshipEnds(entity);
  }

  // EntityProfileState

  const entityProfileState = createEntityProfileStateForEdit(
    language, vocabularies, model.getId(),
    availableProfiles, range.profiling, noProfile, range.iri ?? "",
    range.name, range.nameFromProfiled,
    range.description, range.descriptionFromProfiled,
    range.usageNote, range.usageNoteFromProfiled);

  // RelationshipState<EntityRepresentative>

  const relationshipProfileState = createRelationshipProfileStateForEdit(
    domain.concept, domains, domain.cardinality,
    range.concept, ranges, range.cardinality);

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
