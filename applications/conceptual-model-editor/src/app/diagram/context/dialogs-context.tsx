import React, { type ReactNode, useContext } from "react";
import { useEntityDetailDialog } from "../dialog/entity-detail-dialog";
import type { EntityDetailSupportedType } from "../util/detail-utils";
import { useModifyEntityDialog } from "../dialog/modify-entity-dialog";
import type { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import type {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import type { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { type ProfileDialogSupportedTypes, useCreateProfileDialog } from "../dialog/create-profile-dialog";

type ModificationDialogSupportedTypes =
    | SemanticModelClass
    | SemanticModelClassUsage
    | SemanticModelRelationship
    | SemanticModelRelationshipUsage;

export type DialogsContextType = {
    openDetailDialog: (entity: EntityDetailSupportedType) => void;
    openModificationDialog: (entity: ModificationDialogSupportedTypes, model?: InMemorySemanticModel | null) => void;
    openProfileDialog: (entity: ProfileDialogSupportedTypes) => void;
};

/**
 * @deprecated
 */
export const DialogsContext = React.createContext(null as unknown as DialogsContextType);

/**
 * @deprecated
 */
export const DialogsContextProvider = (props: { children: ReactNode }) => {
    const { openEntityDetailDialog, isEntityDetailDialogOpen, EntityDetailDialog } = useEntityDetailDialog();
    const { isModifyEntityDialogOpen, ModifyEntityDialog, openModifyEntityDialog } = useModifyEntityDialog();
    const { openCreateProfileDialog, isCreateProfileDialogOpen, CreateProfileDialog } = useCreateProfileDialog();

    return (
        <DialogsContext.Provider
            value={{
                openDetailDialog: openEntityDetailDialog,
                openModificationDialog: openModifyEntityDialog,
                openProfileDialog: openCreateProfileDialog,
            }}
        >
            {props.children}
            {isEntityDetailDialogOpen && <EntityDetailDialog />}
            {isModifyEntityDialogOpen && <ModifyEntityDialog />}
            {isCreateProfileDialogOpen && <CreateProfileDialog />}
        </DialogsContext.Provider>
    );
};

/**
 * Provides all the dialogs in one place, simply call for example `openDetailDialog` if you want to open it.
 *
 * @deprecated
 */
export const useDialogsContext = (): DialogsContextType => {
    const context = useContext(DialogsContext);
    if (!context) {
        throw new Error("useDialogsContext must be used within a DialogsContextProvider");
    }
    return context;
};
