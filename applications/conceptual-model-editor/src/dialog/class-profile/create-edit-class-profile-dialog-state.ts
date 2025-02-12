import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { isSemanticModelClassProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditClassProfileDialogState } from "./edit-class-profile-dialog-controller";
import { listClassToProfiles, representUndefinedClass } from "../utilities/dialog-utilities";
import { DialogWrapper } from "../dialog-api";
import { EditClassProfileDialog } from "./edit-class-profile-dialog";
import { MissingEntity, RuntimeError } from "../../application/error";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { createEntityProfileStateForEdit } from "../utilities/entity-profile-utilities";

export function createEditClassProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  model: InMemorySemanticModel,
  entityIdentifier: string,
): EditClassProfileDialogState {
  const entities = graphContext.aggregatorView.getEntities();

  const aggregate = entities[entityIdentifier];
  const entity = aggregate.rawEntity;
  if (entity === null) {
    throw new MissingEntity(entityIdentifier);
  }

  const vocabularies = entityModelsMapToCmeVocabulary(
    graphContext.models, visualModel);

  // EntityProfileState

  const availableProfiles = listClassToProfiles(
    classesContext, graphContext, vocabularies);

  if (isSemanticModelClassUsage(entity)) {
    return createEntityProfileStateForEdit(
      language, vocabularies, model.getId(),
      availableProfiles, [entity.usageOf], representUndefinedClass(),
      entity.iri ?? "",
      entity.name, entity.name === null ? entity.usageOf : null,
      entity.description, entity.description === null ? entity.usageOf : null,
      entity.usageNote, entity.usageNote === null ? entity.usageOf : null);
  } else if (isSemanticModelClassProfile(entity)) {
    return createEntityProfileStateForEdit(
      language, vocabularies, model.getId(),
      availableProfiles, entity.profiling, representUndefinedClass(),
      entity.iri ?? "",
      entity.name, entity.nameFromProfiled,
      entity.description, entity.descriptionFromProfiled,
      entity.usageNote, entity.usageNoteFromProfiled);
  } else {
    throw new RuntimeError("Unexpected entit type.");
  }
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
