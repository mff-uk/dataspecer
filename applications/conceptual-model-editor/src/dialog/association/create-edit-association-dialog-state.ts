import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { getDomainAndRange } from "../../util/relationship-utils";
import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { EditAssociationDialogState } from "./edit-association-dialog-controller";
import { MissingRelationshipEnds } from "../../application/error";
import { createEntityStateForEdit } from "../utilities/entity-utilities";
import { isRepresentingAttribute, representClasses, representOwlThing, representRelationships } from "../utilities/dialog-utilities";
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

  const vocabularies = entityModelsMapToCmeVocabulary(graphContext.models, visualModel);

  // EntityState
  const entityState = createEntityStateForEdit(
    language, vocabularies, model.getId(), range.iri ?? "", range.name, range.description);

  // SpecializationState

  const specializations =
    representRelationships(models, entityState.allModels, classesContext.relationships)
      .filter(item => isRepresentingAttribute(item));

  const specializationState = createSpecializationStateForEdit(
    language, classesContext, entityState.allModels, specializations, entity.id);

  // RelationshipState

  const owlThing = representOwlThing();
  const classes = [owlThing, ...representClasses(models, entityState.allModels, classesContext.classes)];

  const relationshipState = createRelationshipStateForEdit(
    domain.concept, owlThing, domain.cardinality, classes,
    range.concept, owlThing, range.cardinality, classes);

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
