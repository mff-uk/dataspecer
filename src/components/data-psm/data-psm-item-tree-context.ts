import React from "react";

export interface DataPsmItemTreeContextProps {
    /**
     * Whether the whole subtree should be explicitly readonly.
     */
    readonly: boolean;
}

export const DataPsmItemTreeContext = React.createContext<DataPsmItemTreeContextProps>({
    readonly: false,
});
