import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditAttributeDialogState } from "./edit-attribute-dialog-controller";
import { isRepresentingAttribute, representClasses, listDataTypes, representOwlThing, representRelationships, representUndefinedClass, representUndefinedDataType, selectDefaultModelForAttribute } from "../utilities/dialog-utilities";
import { configuration } from "../../application";
import { createEntityStateForNew } from "../utilities/entity-utilities";
import { createSpecializationStateForNew } from "../utilities/specialization-utilities";
import { createRelationshipStateForNew } from "../utilities/relationship-utilities";
import { DialogWrapper } from "../dialog-api";
import { EditAttributeDialog } from "./edit-attribute-dialog";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { RuntimeError } from "../../application/error";

/**
 * Creates a dialog to add an attribute to an existing entity.
 * Same as create new attribute just set the default domain to the entity.
 */
export function createAddAttributeDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  entity: SemanticModelClass,
): EditAttributeDialogState {

  const models = [...graphContext.models.values()];

  const vocabularies = entityModelsMapToCmeVocabulary(graphContext.models, visualModel);

  // EntityState
  const entityState = createEntityStateForNew(
    language, null, vocabularies, configuration().nameToIri);

  // SpecializationState

  const specializations =
    representRelationships(models, entityState.allModels, classesContext.relationships)
      .filter(item => isRepresentingAttribute(item));

  const specializationState = createSpecializationStateForNew(
    language, entityState.allModels, specializations);

  // RelationshipState

  const classes = [
    representUndefinedClass(),
    representOwlThing(),
    ...representClasses(models, entityState.allModels, classesContext.classes)
  ];

  const domain = classes.find(item => item.identifier === entity.id);
  if (domain === undefined) {
    throw new RuntimeError("Missing domain representative");
  }

  const dataTypes = listDataTypes();

  const relationshipState = createRelationshipStateForNew(
    domain, classes, representUndefinedDataType(), dataTypes);

  return {
    ...entityState,
    ...specializationState,
    ...relationshipState,
    model : selectDefaultModelForAttribute(
      entity.id, models, entityState.availableModels),
  };
}

export const createAddAttributeDialog = (
  state: EditAttributeDialogState,
  onConfirm: (state: EditAttributeDialogState) => void,
): DialogWrapper<EditAttributeDialogState> => {
  return {
    label: "dialog.attribute.label-create",
    component: EditAttributeDialog,
    state,
    confirmLabel: "dialog.attribute.ok-create",
    cancelLabel: "dialog.attribute.cancel",
    validate: () => true,
    onConfirm: onConfirm,
    onClose: null,
  };
}
