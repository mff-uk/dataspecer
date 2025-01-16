import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModelClass, isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { SemanticModelClassUsage, isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditClassProfileDialogState } from "./edit-class-profile-dialog-controller";
import { EntityRepresentative, representClassProfiles, representClasses } from "../utilities/dialog-utilities";
import { DialogWrapper } from "../dialog-api";
import { EditClassProfileDialog } from "./edit-class-profile-dialog";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { CmeModel } from "../../dataspecer/cme-model";
import { createEntityProfileStateForNewEntityProfile, createEntityProfileStateForNewProfileOfProfile } from "../utilities/entity-profile-utilities";
import { configuration } from "../../application";

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
  const entityProfileState = createEntityProfileStateForNewEntityProfile(
    language, vocabularies, profiles, entity.id,
    configuration().nameToClassIri);

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

  const entityProfileState = createEntityProfileStateForNewProfileOfProfile(
    language, vocabularies, profiles, entity.id, configuration().nameToClassIri);

  return {
    ...entityProfileState,
  };
}

export const createNewClassProfileDialog = (
  state: EditClassProfileDialogState,
  onConfirm: (state: EditClassProfileDialogState) => void | null,
): DialogWrapper<EditClassProfileDialogState> => {
  return {
    label: "dialog.class-profile.label-create",
    component: EditClassProfileDialog,
    state,
    confirmLabel: "dialog.class-profile.ok-create",
    cancelLabel: "dialog.class-profile.cancel",
    validate: () => true,
    onConfirm,
    onClose: null,
  };
};
