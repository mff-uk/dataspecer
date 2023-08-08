import React, { useContext } from "react";
import { PimClass } from "@dataspecer/core/pim/model";
import { getRandomName } from "~/app/utils/random-gen";

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
    id: string;
};

export const useLocalChangesContext = () => {
    const { localChanges, setLocalChanges } = useContext(LocalChangesContext);

    const changeClass = (cls: PimClass, action: LocalChangeType) => {
        setLocalChanges([...localChanges, { onClass: cls, action, id: getRandomName(8) }]);
    };

    const classHasChanged = (cls: PimClass) => {
        if (localChanges.find((lc) => lc.onClass.iri === cls.iri)) {
            return true;
        }

        return false;
    };

    const undoChange = (localChange: LocalChange) => {
        setLocalChanges([...localChanges.filter((lc) => lc.id !== localChange.id)]);
    };

    return { localChanges, changeClass, classHasChanged, undoChange };
};
