import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";

import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { Options } from "../application";
import { ClassDialogState, createEditClassDialogState } from "../dialog/class/edit-class-dialog-state";
import { createEditClassDialog } from "../dialog/class/edit-class-dialog";
import { classDialogStateToNewCmeClass } from "../dialog/class/edit-class-dialog-state-adapter";
import { CmeModelOperationExecutor } from "../dataspecer/cme-model/cme-model-operation-executor";

export function openEditClassDialogAction(
  cmeExecutor: CmeModelOperationExecutor,
  options: Options,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  visualModel: VisualModel | null,
  model: InMemorySemanticModel,
  entity: SemanticModelClass,
) {
  const initialState = createEditClassDialogState(
    classes, graph, visualModel, options.language, model, entity);

  const onConfirm = (state: ClassDialogState) => {
    cmeExecutor.updateClass({
      identifier: entity.id,
      ...classDialogStateToNewCmeClass(state),
    });
    cmeExecutor.updateSpecialization(
      { identifier: entity.id, model: model.getId() },
      state.model.dsIdentifier,
      initialState.specializations, state.specializations);
  };

  dialogs.openDialog(createEditClassDialog(initialState, onConfirm));
}
