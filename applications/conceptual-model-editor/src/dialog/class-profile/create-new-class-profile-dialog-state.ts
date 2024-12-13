import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { isSemanticModelClass, SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassUsage, SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditClassProfileDialogState } from "./edit-class-profile-dialog-controller";
import { EntityRepresentative, representClasses, representClassProfiles } from "../utilities/dialog-utilities";
import { DialogWrapper } from "../dialog-api";
import { EditClassProfileDialog } from "./edit-class-profile-dialog";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { createEntityProfileStateForNew } from "../utilities/entity-profile-utilities";
import { CmeModel } from "../../cme-model";

export function createNewProfileClassDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  entity: SemanticModelClass | SemanticModelClassUsage,
): EditClassProfileDialogState {

  const entities = graphContext.aggregatorView.getEntities();

  const models = [...graphContext.models.values()];

  const vocabularies = entityModelsMapToCmeVocabulary(graphContext.models, visualModel);

  // EntityProfileState

  const profiles = [
    ...representClasses(models, vocabularies, classesContext.classes),
    ...representClassProfiles(entities, models, vocabularies, classesContext.profiles.filter(item => isSemanticModelClassUsage(item))),
  ];

  if (isSemanticModelClass(entity)) {
    return createForSemanticClass(language, vocabularies, profiles, entity);
  } else {
    return createForSemanticClassProfile(language, vocabularies, profiles, entity);
  }
}

function createForSemanticClass(
  language: string,
  vocabularies: CmeModel[],
  profiles: EntityRepresentative[],
  entity: SemanticModelClass,
) {
  const entityProfileState = createEntityProfileStateForNew(
    language, vocabularies, profiles, entity.id);

  return {
    ...entityProfileState,
  };
}

function createForSemanticClassProfile(
  language: string,
  vocabularies: CmeModel[],
  profiles: EntityRepresentative[],
  entity: SemanticModelClassUsage,
) {
  // We can get all the information from the profile representation.

  const entityProfileState = createEntityProfileStateForNew(
    language, vocabularies, profiles, entity.id);

  return {
    ...entityProfileState,
  };
}

export const createNewClassProfileDialog = (
  state: EditClassProfileDialogState,
  onConfirm: (state: EditClassProfileDialogState) => void | null,
): DialogWrapper<EditClassProfileDialogState> => {
  return {
    label: "create-class-profile-dialog.label",
    component: EditClassProfileDialog,
    state,
    confirmLabel: "create-profile-dialog.btn-ok",
    cancelLabel: "create-profile-dialog.btn-close",
    validate: () => true,
    onConfirm,
    onClose: null,
  };
};