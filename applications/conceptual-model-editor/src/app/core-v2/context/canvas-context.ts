import React, { useContext } from "react";

export type CanvasContextType = {
    visibleOnCanvas: Map<string, boolean>
    setVisibleOnCanvas: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
};

export const CanvasContext = React.createContext(null as unknown as CanvasContextType);

export const useCanvasContext = () => {
    const { visibleOnCanvas, setVisibleOnCanvas } = useContext(CanvasContext);

    return { visibleOnCanvas };
};
