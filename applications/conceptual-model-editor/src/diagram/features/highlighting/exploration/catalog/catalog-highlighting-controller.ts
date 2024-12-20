import { useCallback, useMemo } from "react";
import { useExploration } from "../context/highlighting-exploration-mode";
import { ReactFlowInstance } from "@xyflow/react";
import { EdgeType, NodeType } from "../../../../diagram-controller";

export const getDefaultClassNamesForEntityCatalogRow = () => {
    return "flex flex-row justify-between flex-wrap whitespace-nowrap hover:shadow highlight-catalog-transition-default";
};

export const getClassNamesForHiddenEntityCatalogRow = () => {
    return getDefaultClassNamesForEntityCatalogRow() + " highlight-opposite";
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
    const { highlightLevels, changeHighlight, resetHighlight, semanticToVisualIdentifierMap, shouldShrinkCatalog, isHighlightingChangeAllowed } = useExploration();

    const highlightEntity = (entityId: string, reactFlowInstance: ReactFlowInstance<NodeType, EdgeType>) => {
        changeHighlight(entityId, reactFlowInstance, false);
    };

    const getClassNames = useCallback((entityId: string) => {
        entityId = semanticToVisualIdentifierMap[entityId];
        return getClassNamesBasedOnHighlighting(highlightLevels, entityId);
    }, [highlightLevels]);

    const isEntityHighlighted = useCallback((entityId: string) => {
        return semanticToVisualIdentifierMap[entityId] != undefined;
    }, [highlightLevels]);

    const isAnyEntityHighlighted = useMemo(() => Object.values(highlightLevels).length, [highlightLevels]);

    return {
        highlightEntity,
        resetHighlight,
        getClassNames,
        shouldShrinkCatalog,
        isEntityHighlighted,
        isAnyEntityHighlighted,
        isHighlightingChangeAllowed
    };
};