import { useCallback, useMemo } from "react";
import { useExploration } from "../context/highlighting-exploration-mode";
import { ReactFlowInstance } from "@xyflow/react";
import { EdgeType, NodeType } from "../../../../diagram-controller";

export const getDefaultClassNamesForEntityCatalogRow = () => {
    return "flex flex-row justify-between flex-wrap whitespace-nowrap hover:shadow highlight-catalog-transition-default";
};

const getClassNamesBasedOnHighlighting = (
    highlightLevels: Record<string, number>,
    semanticEntityId: string
): string => {
    let classNamesSuffix = "";
    let classNames = getDefaultClassNamesForEntityCatalogRow();

    if(Object.values(highlightLevels).length === 0) {
        classNamesSuffix = "";
    }
    else {
        if(highlightLevels[semanticEntityId] === 0) {
            classNamesSuffix = " catalog-highlight-main";
        }
        else if(highlightLevels[semanticEntityId] === 1) {
            classNamesSuffix = " catalog-highlight-secondary";
        }
        else {
            classNamesSuffix = " highlight-opposite";
        }
    }

    classNames = classNames + classNamesSuffix;
    return classNames;
};

export const useCatalogHighlightingController = () => {
    const {
        highlightLevels,
        changeHighlight,
        resetHighlight,
        semanticToVisualIdentifierMap,
        shouldShrinkCatalog,
        isHighlightingChangeAllowed,
        modelOfClassWhichStartedHighlighting,
    } = useExploration();

    const highlightEntity = (
        entityId: string,
        reactFlowInstance: ReactFlowInstance<NodeType, EdgeType>,
        modelOfClassWhichStartedHighlighting: string | null
    ) => {
        changeHighlight(entityId, reactFlowInstance, false, modelOfClassWhichStartedHighlighting);
    };

    const getClassNames = useCallback((semanticEntityId: string) => {
        semanticEntityId = semanticToVisualIdentifierMap[semanticEntityId];
        return getClassNamesBasedOnHighlighting(highlightLevels, semanticEntityId);
    }, [highlightLevels]);

    const isEntityHighlighted = useCallback((semanticEntityId: string) => {
        return semanticToVisualIdentifierMap[semanticEntityId] != undefined;
    }, [highlightLevels]);

    const isAnyEntityHighlighted = useMemo(() => Object.values(highlightLevels).length, [highlightLevels]);

    return {
        highlightEntity,
        resetHighlight,
        getClassNames,
        shouldShrinkCatalog,
        isEntityHighlighted,
        isAnyEntityHighlighted,
        isHighlightingChangeAllowed,
        modelOfClassWhichStartedHighlighting,
    };
};