
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditAssociationProfileDialogState } from "./edit-association-profile-dialog-controller";
import { getDomainAndRange } from "../../util/relationship-utils";
import { InvalidAggregation, MissingEntity, MissingRelationshipEnds } from "../../application/error";
import { createEntityProfileStateForEdit } from "../utilities/entity-profile-utilities";
import { createRelationshipProfileStateForEdit } from "../utilities/relationship-profile-utilities";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { DialogWrapper } from "../dialog-api";
import { EditAssociationProfileDialog } from "./edit-association-profile-dialog";
import { representClassProfiles, representOwlThing, representRelationshipProfiles, representRelationships } from "../utilities/dialog-utilities";

export function createEditAssociationProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  model: InMemorySemanticModel,
  entityIdentifier: string,
): EditAssociationProfileDialogState {
  const entities = graphContext.aggregatorView.getEntities();
  const aggregate = entities[entityIdentifier];
  const entity = aggregate.rawEntity;
  const aggregated = aggregate.aggregatedEntity;
  if (entity === null) {
    throw new MissingEntity(entityIdentifier);
  }
  if (!isSemanticModelRelationshipUsage(entity) || !isSemanticModelRelationshipUsage(aggregated)) {
    throw new InvalidAggregation(entity, null);
  }

  const { domain, range } = getDomainAndRange(entity);
  const { domain: aggregatedDomain, range: aggregatedRange } = getDomainAndRange(aggregated);
  if (domain === null || range === null || aggregatedDomain === null || aggregatedRange === null) {
    throw new MissingRelationshipEnds(entity);
  }

  const models = [...graphContext.models.values()];

  const vocabularies = entityModelsMapToCmeVocabulary(graphContext.models, visualModel);

  // EntityProfileState

  const profiles = [
    ...representRelationships(models, vocabularies,
      classesContext.relationships),
    ...representRelationshipProfiles(entities, models, vocabularies,
      classesContext.profiles.filter(item => isSemanticModelRelationshipUsage(item))),
  ];

  const entityProfileState = createEntityProfileStateForEdit(
    language, vocabularies, model.getId(),
    profiles, entity.usageOf,
    range.iri ?? "", range.name, range.description, range.usageNote);

  // RelationshipState<EntityRepresentative>

  const owlThing = representOwlThing();
  const classProfiles = [
    ...representClassProfiles(entities, models, vocabularies,
      classesContext.profiles.filter(item => isSemanticModelClassUsage(item))),
  ];

  const relationshipProfileState = createRelationshipProfileStateForEdit(
    domain.concept, aggregatedDomain.concept, owlThing,
    domain.cardinality, aggregatedDomain.cardinality,
    classProfiles,
    range.concept, aggregatedRange.concept, owlThing,
    range.cardinality, aggregatedRange.cardinality,
    classProfiles);

  return {
    ...entityProfileState,
    ...relationshipProfileState,
  };

}

export const createEditAssociationProfileDialog = (
  state: EditAssociationProfileDialogState,
  onConfirm: (state: EditAssociationProfileDialogState) => void,
): DialogWrapper<EditAssociationProfileDialogState> => {
  return {
    label: "dialog.association-profile.label-edit",
    component: EditAssociationProfileDialog,
    state,
    confirmLabel: "dialog.association-profile.ok-edit",
    cancelLabel: "dialog.association-profile.cancel",
    validate: () => true,
    onConfirm: onConfirm,
    onClose: null,
  };
}
