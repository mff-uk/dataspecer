import React, { useContext } from "react";

export type VisualizationContextType = {
    hideOwlThing: boolean;
    setHideOwlThing: React.Dispatch<React.SetStateAction<boolean>>;
};

export const VisualizationContext = React.createContext(null as unknown as VisualizationContextType);

export const useVisualizationContext = () => {
    const { hideOwlThing, setHideOwlThing } = useContext(VisualizationContext);

    return {
        hideOwlThing,
        setHideOwlThing,
    };
};
