
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModelRelationship, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { SemanticModelRelationshipUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { getDomainAndRange } from "../../util/relationship-utils";
import { EditAttributeProfileDialogState } from "./edit-attribute-profile-dialog-controller";
import { EditAttributeProfileDialog } from "./edit-attribute-profile-dialog";
import { DialogWrapper } from "../dialog-api";
import { CmeModel } from "../../dataspecer/cme-model";
import { InvalidAggregation, MissingRelationshipEnds } from "../../application/error";
import { createRelationshipProfileStateForNew } from "../utilities/relationship-profile-utilities";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { EntityRepresentative, RelationshipRepresentative, listDataTypes, representUndefinedDataType, listClassProfiles } from "../utilities/dialog-utilities";
import { createEntityProfileStateForNewEntityProfile, findProfile } from "../utilities/entity-profile-utilities";
import { configuration } from "../../application";
import { listAttributesToProfile } from "./attribute-profile-utilities";

/**
 * State represents a newly created profile for given profiled entity.
 */
export function createNewAttributeProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  profiled: SemanticModelRelationship | SemanticModelRelationshipUsage,
): EditAttributeProfileDialogState {
  const vocabularies = entityModelsMapToCmeVocabulary(
    graphContext.models, visualModel);

  const availableProfiles = listAttributesToProfile(
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
    //
    return createForAttributeOrUsage(
      classProfiles, language, vocabularies,
      availableProfiles, profileOf,
      domain.concept, domain.cardinality,
      range.concept, range.cardinality);
  } else {
    const entities = graphContext.aggregatorView.getEntities();
    const aggregated = entities[profiled.id]?.aggregatedEntity;
    if (!isSemanticModelRelationshipUsage(aggregated)) {
      throw new InvalidAggregation(profiled.id, aggregated);
    }
    const { domain, range } = getDomainAndRange(aggregated);
    if (domain === null || range === null) {
      throw new MissingRelationshipEnds(aggregated);
    }
    //
    return createForAttributeOrUsage(
      classProfiles, language, vocabularies,
      availableProfiles, profileOf,
      domain.concept, domain.cardinality,
      range.concept, range.cardinality);
  }
}

function createForAttributeOrUsage(
  classProfiles: EntityRepresentative[],
  language: string,
  vocabularies: CmeModel[],
  availableProfiles: RelationshipRepresentative[],
  profileOf: RelationshipRepresentative,
  domainConcept: string | null,
  domainCardinality: [number, number | null] | undefined | null,
  range: string | null,
  rangeCardinality: [number, number | null] | undefined | null,
): EditAttributeProfileDialogState {

  // EntityProfileState

  const entityProfileState = createEntityProfileStateForNewEntityProfile(
    language, vocabularies, availableProfiles, profileOf.identifier,
    configuration().nameToIri);

  // RelationshipState<EntityRepresentative>

  const relationshipProfileState = createRelationshipProfileStateForNew(
    profileOf,
    domainConcept, domainCardinality, classProfiles,
    range, representUndefinedDataType(), rangeCardinality, listDataTypes());

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
