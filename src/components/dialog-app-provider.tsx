import React, {useMemo} from "react";
import {useDialog} from "../hooks/useDialog";
import {LabelAndDescriptionLanguageStrings, LabelDescriptionEditor} from "./helper/LabelDescriptionEditor";

interface Context {
    updateLabels: (data: {
       data: LabelAndDescriptionLanguageStrings,
       update: (data: LabelAndDescriptionLanguageStrings) => void,
    }) => void,
}

export const DialogAppProviderContext = React.createContext<Context>({} as Context);

export const DialogAppProvider: React.FC = ({children}) => {
    const updateLabels = useDialog(LabelDescriptionEditor, ["data", "update"], {
        data: {label: {}, description: {}},
        update: () => {}
    });

    const context = useMemo(() => ({
        updateLabels: updateLabels.open,
    }) as Context, [updateLabels.open]);

    return <DialogAppProviderContext.Provider value={context}>
        {children}
        <updateLabels.Component />
    </DialogAppProviderContext.Provider>
}
