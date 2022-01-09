import React from "react";

export const DefaultDataPsmItemTreeContext = {
    /**
     * Whether the whole subtree should be explicitly readonly.
     */
    readonly: false,

    ignoreReadOnlyStyles: false,
}

export const DataPsmItemTreeContext = React.createContext(DefaultDataPsmItemTreeContext);
