import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { getDomainAndRange } from "../../util/relationship-utils";
import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { EditAssociationDialogState } from "./edit-association-dialog-controller";
import { MissingRelationshipEnds } from "../../application/error";
import { createEntityStateForEdit } from "../utilities/entity-utilities";
import { isRepresentingAssociation, listRelationshipDomains, representOwlThing, representRelationships, sortRepresentatives } from "../utilities/dialog-utilities";
import { createSpecializationStateForEdit } from "../utilities/specialization-utilities";
import { createRelationshipStateForEdit } from "../utilities/relationship-utilities";
import { DialogWrapper } from "../dialog-api";
import { EditAssociationDialog } from "./edit-association-dialog";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";

export function createEditAssociationDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  model: InMemorySemanticModel,
  entity: SemanticModelRelationship,
): EditAssociationDialogState {

  const { domain, range } = getDomainAndRange(entity);
  if (domain === null || range === null) {
    throw new MissingRelationshipEnds(entity);
  }

  const models = [...graphContext.models.values()];

  const vocabularies = entityModelsMapToCmeVocabulary(
    graphContext.models, visualModel);

  const owlThing = representOwlThing();

  // EntityState
  const entityState = createEntityStateForEdit(
    language, vocabularies, model.getId(), range.iri ?? "",
    range.name, range.description);

  // SpecializationState

  const specializations = representRelationships(
    models, entityState.allModels, classesContext.relationships,
    owlThing.identifier, owlThing.identifier)
    .filter(item => isRepresentingAssociation(item));
  sortRepresentatives(language, specializations);

  const specializationState = createSpecializationStateForEdit(
    language, classesContext, entityState.allModels, specializations, entity.id);

  // RelationshipState

  const domains = listRelationshipDomains(
    classesContext, graphContext, vocabularies);
  sortRepresentatives(language, domains);

  const relationshipState = createRelationshipStateForEdit(
    vocabularies,
    domain.concept ?? owlThing.identifier, domain.cardinality, domains,
    range.concept ?? owlThing.identifier, range.cardinality, domains);

  return {
    ...entityState,
    ...specializationState,
    ...relationshipState,
  };
}

export const createEditAssociationDialog = (
  state: EditAssociationDialogState,
  onConfirm: (state: EditAssociationDialogState) => void,
): DialogWrapper<EditAssociationDialogState> => {
  return {
    label: "dialog.association.label-edit",
    component: EditAssociationDialog,
    state,
    confirmLabel: "dialog.association.ok-edit",
    cancelLabel: "dialog.association.cancel",
    validate: () => true,
    onConfirm: onConfirm,
    onClose: null,
  };
}
