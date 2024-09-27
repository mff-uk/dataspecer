import { DialogApiContextType } from "../../dialog/dialog-service";
import { createAddModelDialog } from "../../dialog/model/create-model-dialog";


/**
 * Creates multiple profile dialogs. One dialog for each selected entity.
 */
export const createProfileDialogsForSelection = (selection: string[], dialogs: DialogApiContextType | null): void => {
    const onConfirm = (remainingSelection: string[]) =>(() => {
        if(remainingSelection.length > 0) {
            const entityToCreateProfileOf = remainingSelection.at(-1);
            remainingSelection = remainingSelection.slice(0, -1);
            dialogs?.openDialog(createProfileDialog(entityToCreateProfileOf, onConfirm(remainingSelection)));
        }
    });

    onConfirm(selection)();
};