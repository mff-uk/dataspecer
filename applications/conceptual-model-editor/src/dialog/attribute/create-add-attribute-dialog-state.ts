import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditAttributeDialogState } from "./edit-attribute-dialog-controller";
import { isRepresentingAttribute, representClasses, representDataTypes, representOwlThing, representRelationships, selectDefaultModelForAttribute, selectRdfLiteral } from "../utilities/dialog-utilities";
import { configuration } from "../../application";
import { createEntityStateForNew } from "../utilities/entity-utilities";
import { createSpecializationStateForNew } from "../utilities/specialization-utilities";
import { createRelationshipStateForNew } from "../utilities/relationship-utilities";
import { DialogWrapper } from "../dialog-api";
import { EditAttributeDialog } from "./edit-attribute-dialog";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";

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

  const owlThing = representOwlThing();
  const classes = [owlThing, ...representClasses(models, entityState.allModels, classesContext.classes)];

  const dataTypes = [...representDataTypes()];
  const range = selectRdfLiteral(dataTypes);

  const relationshipState = createRelationshipStateForNew(
    owlThing, classes, range, dataTypes);

  // We try to use the given entity as a default value.
  const domain = relationshipState.availableDomainItems.find(
    item => item.identifier === entity.id) ?? owlThing;

  return {
    ...entityState,
    ...specializationState,
    ...relationshipState,
    model : selectDefaultModelForAttribute(
      entity.id, models, entityState.availableModels),
    domain,
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
