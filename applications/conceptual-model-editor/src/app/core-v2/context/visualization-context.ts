import React, { useContext } from "react";
import { XYPosition } from "reactflow";
import { getRandomPosition } from "../util/utils";

export type VisualizationContextType = {
    hideOwlThing: boolean;
    setHideOwlThing: React.Dispatch<React.SetStateAction<boolean>>;
    classPositionMap: Map<string, XYPosition>;
    setClassPositionMap: React.Dispatch<React.SetStateAction<Map<string, XYPosition>>>;
};

export const VisualizationContext = React.createContext(null as unknown as VisualizationContextType);

export const useVisualizationContext = () => {
    const { hideOwlThing, setHideOwlThing, classPositionMap, setClassPositionMap } = useContext(VisualizationContext);

    const getClassPosition = (classId: string) => {
        const pos = classPositionMap.get(classId);
        if (pos) return pos;
        const newPos = getRandomPosition();
        setClassPosition(classId, newPos);
        return newPos;
    };
    const setClassPosition = (classId: string, position: XYPosition | undefined) => {
        if (!position) return;
        setClassPositionMap((prev) => prev.set(classId, position));
    };

    return {
        hideOwlThing,
        setHideOwlThing,
        getClassPosition,
        setClassPosition,
    };
};
