import {
    type SemanticModelClass,
    type SemanticModelRelationship,
    isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import type { VisualEntityModel } from "@dataspecer/core-v2/visual-model";
import { useCanvasContext } from "../context/canvas-context";
import { useEffect, useState } from "react";

export const getCurrentVisibilityOnCanvas = (
    entities: (
        | SemanticModelClass
        | SemanticModelRelationship
        | SemanticModelClassUsage
        | SemanticModelRelationshipUsage
    )[],
    visualModel: VisualEntityModel | null
) => {
    const getDefaultVisibility = () => {
        if (isSemanticModelClass(entities[0] ?? null) || isSemanticModelClassUsage(entities[0] ?? null)) {
            return false;
        }
        return true;
    };

    return entities.map((e) => [e.id, visualModel?.getVisualEntity(e.id)?.visible ?? getDefaultVisibility()] as const);
};

export const useCanvasVisibility = (entityId: string) => {
    const { visibleOnCanvas } = useCanvasContext();
    const [isOnCanvas, setIsOnCanvas] = useState(visibleOnCanvas.get(entityId));

    useEffect(() => {
        const newOnCanvas = visibleOnCanvas.get(entityId);
        if (isOnCanvas != newOnCanvas) {
            setIsOnCanvas(newOnCanvas);
        }
    }, [isOnCanvas, visibleOnCanvas]);

    return { isOnCanvas };
};
