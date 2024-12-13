import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { EditAttributeDialogState } from "./edit-attribute-dialog-controller";
import { isRepresentingAttribute, representClasses, representDataTypes, representOwlThing, representRelationships, representUndefinedDataType } from "../utilities/dialog-utilities";
import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { getDomainAndRange } from "../../util/relationship-utils";
import { MissingRelationshipEnds } from "../../application/error";
import { createEntityStateForEdit } from "../utilities/entity-utilities";
import { createSpecializationStateForEdit } from "../utilities/specialization-utilities";
import { createRelationshipStateForEdit } from "../utilities/relationship-utilities";
import { DialogWrapper } from "../dialog-api";
import { EditAttributeDialog } from "./edit-attribute-dialog";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";

/**
 * @throws
 */
export function createEditAttributeDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  model: InMemorySemanticModel,
  entity: SemanticModelRelationship,
): EditAttributeDialogState {

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

  const undefinedDataType = representUndefinedDataType();
  const dataTypes = [undefinedDataType, ...representDataTypes(),];

  const relationshipState = createRelationshipStateForEdit(
    domain.concept, owlThing, domain.cardinality, classes,
    range.concept, undefinedDataType, range.cardinality, dataTypes);

  return {
    ...entityState,
    ...specializationState,
    ...relationshipState,
  };

}

export const createEditAttributeDialog = (
  state: EditAttributeDialogState,
  onConfirm: (state: EditAttributeDialogState) => void,
): DialogWrapper<EditAttributeDialogState> => {
  return {
    label: "create-attribute-dialog.label",
    component: EditAttributeDialog,
    state,
    confirmLabel: "modify-dialog.btn-ok",
    cancelLabel: "modify-dialog.btn-close",
    validate: () => true,
    onConfirm: onConfirm,
    onClose: null,
  };
}
