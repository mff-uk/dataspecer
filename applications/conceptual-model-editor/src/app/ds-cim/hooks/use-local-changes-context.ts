import React, { useContext } from "react";
import { PimClass } from "@dataspecer/core/pim/model";

export type LocalChangesContextType = {
    localChanges: LocalChange[];
    setLocalChanges: React.Dispatch<React.SetStateAction<LocalChange[]>>;
};

export const LocalChangesContext = React.createContext(null as unknown as LocalChangesContextType);

export enum LocalChangeType {
    RENAME = "RENAME",
    REMOVE = "REMOVE",
    CREATE = "CREATE",
}

export type LocalChange = {
    onClass: PimClass;
    action: LocalChangeType;
};

export const useLocalChangesContext = () => {
    const { localChanges, setLocalChanges } = useContext(LocalChangesContext);

    const changeClass = (cls: PimClass, action: LocalChangeType) => {
        setLocalChanges([...localChanges, { onClass: cls, action }]);
    };

    const classHasChanged = (cls: PimClass) => {
        if (localChanges.find((lc) => lc.onClass.iri === cls.iri)) {
            return true;
        }

        return false;
    };

    return { localChanges, changeClass, classHasChanged };
};
