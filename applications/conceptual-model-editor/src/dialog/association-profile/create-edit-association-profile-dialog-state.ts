
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
import { representClassProfiles, representOwlThing, representUndefinedClass } from "../utilities/dialog-utilities";
import { listAssociationsToProfile } from "./attribute-profile-utilities";

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
    throw new InvalidAggregation(entity.id, aggregated);
  }

  const { domain, range } = getDomainAndRange(entity);
  const { domain: aggregatedDomain, range: aggregatedRange } = getDomainAndRange(aggregated);
  if (domain === null || range === null || aggregatedDomain === null || aggregatedRange === null) {
    throw new MissingRelationshipEnds(entity);
  }

  const models = [...graphContext.models.values()];

  const vocabularies = entityModelsMapToCmeVocabulary(graphContext.models, visualModel);

  // EntityProfileState

  const availableProfiles = listAssociationsToProfile(classesContext, graphContext, vocabularies);

  const entityProfileState = createEntityProfileStateForEdit(
    language, vocabularies, model.getId(),
    availableProfiles, [entity.usageOf], range.iri ?? "",
    entity.name, entity.name === null ? entity.usageOf : null,
    entity.description, entity.description === null ? entity.usageOf : null,
    entity.usageNote, entity.usageNote === null ? entity.usageOf : null);

  // RelationshipState<EntityRepresentative>

  const classProfiles = [
    representUndefinedClass(),
    representOwlThing(),
    ...representClassProfiles(entities, models, vocabularies,
      classesContext.usages.filter(item => isSemanticModelClassUsage(item))),
  ];

  const relationshipProfileState = createRelationshipProfileStateForEdit(
    availableProfiles,
    [entity.usageOf],
    domain.concept, entity.usageOf,
    domain.cardinality, entity.usageOf,
    classProfiles, // available domains
    range.concept, entity.usageOf,
    classProfiles[0], // default range
    range.cardinality, entity.usageOf,
    classProfiles // available ranges
  );

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
