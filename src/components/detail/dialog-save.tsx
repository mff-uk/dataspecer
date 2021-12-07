import React, {useCallback, useEffect, useState} from "react";

export class DialogSaveStatus {
    private readonly listeners: Set<() => void> = new Set();
    private unsavedChangesCounter: number = 0;
    private readonly onUnsavedChangesChanged: (unsaved: boolean) => void;

    constructor(onUnsavedChangesChanged: (unsaved: boolean) => void) {
        this.onUnsavedChangesChanged = onUnsavedChangesChanged;
    }

    addSaveListener(listener: () => void) {
        this.listeners.add(listener);
    }

    removeSaveListener(listener: () => void) {
        this.listeners.delete(listener);
    }

    incrementUnsavedChanges() {
        this.unsavedChangesCounter++;
        if (this.unsavedChangesCounter === 1) {
            this.onUnsavedChangesChanged(true);
        }
    }

    decrementUnsavedChanges() {
        this.unsavedChangesCounter--;
        if (this.unsavedChangesCounter === 0) {
            this.onUnsavedChangesChanged(false);
        }
    }

    triggerSaveListeners() {
        [...this.listeners].forEach(listener => listener());
    }
}

export const DialogSaveStatusContext = React.createContext<DialogSaveStatus>(null as unknown as DialogSaveStatus);

/**
 * Calls save method if there are unsaved changes.
 * @param hasUnsavedChanges
 * @param save
 */
export function useDialogSaveStatus(hasUnsavedChanges: boolean, save: () => void) {
    const dialogSaveStatusContext = React.useContext(DialogSaveStatusContext);
    const saveChanges = useCallback(() => dialogSaveStatusContext.triggerSaveListeners(), [dialogSaveStatusContext]);
    const saveWrapper = useCallback(() => hasUnsavedChanges && save(), [hasUnsavedChanges, save]);

    useEffect(() => {
        if (hasUnsavedChanges) {
            dialogSaveStatusContext.incrementUnsavedChanges();
            return () => dialogSaveStatusContext.decrementUnsavedChanges();
        }
    }, [hasUnsavedChanges, dialogSaveStatusContext]);

    useEffect(() => {
        dialogSaveStatusContext.addSaveListener(saveWrapper);
        return () => dialogSaveStatusContext.removeSaveListener(saveWrapper);
    }, [saveWrapper, dialogSaveStatusContext]);

    return {
        saveChanges
    }
}

export function useDialogSaveStatusProvider() {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [dialogSaveStatusContext] = useState(new DialogSaveStatus(setHasUnsavedChanges));
    const saveChanges = useCallback(() => dialogSaveStatusContext.triggerSaveListeners(), [dialogSaveStatusContext]);

    return {
        hasUnsavedChanges,
        saveChanges,
        dialogSaveStatusContext,
    };
}
