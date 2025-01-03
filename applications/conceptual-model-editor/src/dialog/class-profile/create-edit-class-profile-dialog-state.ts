import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { isSemanticModelClassUsage, SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditClassProfileDialogState } from "./edit-class-profile-dialog-controller";
import { representClasses, representClassProfiles } from "../utilities/dialog-utilities";
import { DialogWrapper } from "../dialog-api";
import { EditClassProfileDialog } from "./edit-class-profile-dialog";
import { InvalidAggregation } from "../../application/error";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { createEntityProfileStateForEdit } from "../utilities/entity-profile-utilities";

export function createEditClassProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  model: InMemorySemanticModel,
  entity: SemanticModelClassUsage,
): EditClassProfileDialogState {

  const entities = graphContext.aggregatorView.getEntities();
  const aggregated = entities[entity.id]?.aggregatedEntity;
  if (!isSemanticModelClassUsage(aggregated)) {
    throw new InvalidAggregation(entity, null);
  }

  const models = [...graphContext.models.values()];

  const vocabularies = entityModelsMapToCmeVocabulary(graphContext.models, visualModel);

  // EntityProfileState

  const profiles = [
    ...representClasses(models, vocabularies, classesContext.classes),
    ...representClassProfiles(entities, models, vocabularies, classesContext.profiles.filter(item => isSemanticModelClassUsage(item))),
  ];

  const entityProfileState = createEntityProfileStateForEdit(
    language, vocabularies, model.getId(),
    profiles, entity.usageOf,
    entity.iri ?? "", entity.name, entity.description, entity.usageNote);

  return {
    ...entityProfileState,
  };
}

export const createEditClassProfileDialog = (
  state: EditClassProfileDialogState,
  onConfirm: (state: EditClassProfileDialogState) => void | null,
): DialogWrapper<EditClassProfileDialogState> => {
  return {
    label: "dialog.class-profile.label-edit",
    component: EditClassProfileDialog,
    state,
    confirmLabel: "dialog.class-profile.ok-edit",
    cancelLabel: "dialog.class-profile.cancel",
    validate: () => true,
    onConfirm,
    onClose: null,
  };
};
