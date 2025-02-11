
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModelRelationship, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { SemanticModelRelationshipUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditAssociationProfileDialogState } from "./edit-association-profile-dialog-controller";
import { EntityRepresentative, listClassProfiles, RelationshipRepresentative } from "../utilities/dialog-utilities";
import { getDomainAndRange } from "../../util/relationship-utils";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { InvalidAggregation, MissingRelationshipEnds } from "../../application/error";
import { CmeModel } from "../../dataspecer/cme-model";
import { createRelationshipProfileStateForNew } from "../utilities/relationship-profile-utilities";
import { EditAssociationProfileDialog } from "./edit-association-profile-dialog";
import { DialogWrapper } from "../dialog-api";
import { createEntityProfileStateForNewEntityProfile, findProfile } from "../utilities/entity-profile-utilities";
import { configuration } from "../../application";
import { listAssociationsToProfile } from "./attribute-profile-utilities";

/**
 * State represents a newly created profile for given profiled entity.
 */
export function createNewAssociationProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  profiled: SemanticModelRelationship | SemanticModelRelationshipUsage,
): EditAssociationProfileDialogState {
  const entities = graphContext.aggregatorView.getEntities();

  const vocabularies = entityModelsMapToCmeVocabulary(
    graphContext.models, visualModel);

  const availableProfiles = listAssociationsToProfile(
    classesContext, graphContext, vocabularies);

  const profileOf = findProfile(availableProfiles, profiled.id);

  const classProfiles = listClassProfiles(
    classesContext, graphContext, vocabularies);

  // Rest of this function depends of what we are profiling.
  if (isSemanticModelRelationship(profiled)) {
    const { domain, range } = getDomainAndRange(profiled);
    if (domain === null || range === null) {
      throw new MissingRelationshipEnds(profiled);
    }
    // Here we use nulls as default values, as we can not use
    // values from the relation as the ends are not profiles!
    return createForAssociationOrUsage(
      classProfiles, language, vocabularies,
      availableProfiles, profileOf,
      null, domain.cardinality,
      null, range.cardinality);
  } else {
    const aggregated = entities[profiled.id]?.aggregatedEntity;
    if (!isSemanticModelRelationshipUsage(aggregated)) {
      throw new InvalidAggregation(profiled.id, aggregated);
    }
    const { domain, range } = getDomainAndRange(aggregated);
    if (domain === null || range === null) {
      throw new MissingRelationshipEnds(profiled);
    }
    //
    return createForAssociationOrUsage(
      classProfiles, language, vocabularies,
      availableProfiles, profileOf,
      domain.concept, domain.cardinality,
      range.concept, range.cardinality);
  }
}

function createForAssociationOrUsage(
  classProfiles: EntityRepresentative[],
  language: string,
  vocabularies: CmeModel[],
  availableProfiles: RelationshipRepresentative[],
  profileOf: RelationshipRepresentative,
  domainConcept: string | null,
  domainCardinality: [number, number | null] | undefined | null,
  rangeConcept: string | null,
  rangeCardinality: [number, number | null] | undefined | null,
): EditAssociationProfileDialogState {

  // EntityProfileState

  const entityProfileState = createEntityProfileStateForNewEntityProfile(
    language, vocabularies, availableProfiles, profileOf.identifier,
    configuration().nameToIri);

  // RelationshipState<EntityRepresentative>

  const relationshipProfileState = createRelationshipProfileStateForNew(
    profileOf,
    domainConcept, domainCardinality, classProfiles,
    rangeConcept, classProfiles[0], rangeCardinality, classProfiles);

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
    label: "dialog.association-profile.label-create",
    component: EditAssociationProfileDialog,
    state,
    confirmLabel: "dialog.association-profile.ok-create",
    cancelLabel: "dialog.association-profile.cancel",
    validate: () => true,
    onConfirm: onConfirm,
    onClose: null,
  };
}

