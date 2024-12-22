import { getConnectedEdges, ReactFlowInstance } from "@xyflow/react";
import React, { useContext, useState, useMemo } from "react";
import { EdgeType, NodeType } from "../../../../diagram-controller";


/**
 * Highlighting exploration interface
 */
export interface Exploration {
  isHighlightingOn: boolean;

  toggleHighlighting: () => void;

  highlightLevels: Record<string, number>;

  setHighlightLevels: React.Dispatch<React.SetStateAction<Record<string, number>>>;

  semanticToVisualIdentifierMap: Record<string, string>;

  setSemanticToVisualIdentifierMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  isHighlightingInternallyOn: boolean;

  setIsHighlightingInternallyOn: React.Dispatch<React.SetStateAction<boolean>>;

  shouldShrinkCatalog: boolean;

  setShouldShrinkCatalog: React.Dispatch<React.SetStateAction<boolean>>;
}

const ExplorationContext = React.createContext<Exploration>(null as any);

export const ExplorationContextProvider = (props: { children: React.ReactNode }) => {
  const [isHighlightingOn, setIsHighlightingOn] = useState(false);
  const [highlightLevels, setHighlightLevels] = useState<Record<string, number>>({});
  const [isHighlightingInternallyOn, setIsHighlightingInternallyOn] = useState<boolean>(true);
  const [semanticToVisualIdentifierMap, setSemanticToVisualIdentifierMap] = useState<Record<string, string>>({});
  const [shouldShrinkCatalog, setShouldShrinkCatalog] = useState<boolean>(false);

  // TODO RadStr: Probably not the best use of memo
  const context = useMemo(() => {
    return {
        isHighlightingOn,
        toggleHighlighting: () => setIsHighlightingOn(prev => !prev),

        highlightLevels,
        setHighlightLevels,

        semanticToVisualIdentifierMap,
        setSemanticToVisualIdentifierMap,

        isHighlightingInternallyOn,
        setIsHighlightingInternallyOn,

        shouldShrinkCatalog,
        setShouldShrinkCatalog
    };
  }, [isHighlightingOn, setIsHighlightingOn, highlightLevels, setHighlightLevels,
    isHighlightingInternallyOn, setIsHighlightingInternallyOn, semanticToVisualIdentifierMap, setSemanticToVisualIdentifierMap,
    shouldShrinkCatalog, setShouldShrinkCatalog]);

  return (
    <ExplorationContext.Provider value={context}>
      {props.children}
    </ExplorationContext.Provider>
  );
};


const setHighlightLevelDataForNode = (
    node: NodeType,
    newVisualIdentifierToSemanticIdentifierMap: Record<string, string>,
    newHighlightLevelsMap: Record<string, number>,
    highlightLevel: 0 | 1
) => {
    newVisualIdentifierToSemanticIdentifierMap[node.data.externalIdentifier] = node.id;
    newHighlightLevelsMap[node.id] = highlightLevel;
};

const isInMainHighlight = (
    mainHighlightedNodes: NodeType[],
    mainHighlightCandidateIdentifier: string
) => mainHighlightedNodes.find(mainHighlightedNode => mainHighlightCandidateIdentifier === mainHighlightedNode.id) !== undefined;

export const useExploration = () => {
    const {
        highlightLevels,
        setHighlightLevels,
        semanticToVisualIdentifierMap,
        setSemanticToVisualIdentifierMap,
        isHighlightingInternallyOn,
        setIsHighlightingInternallyOn,
        isHighlightingOn,
        toggleHighlighting,
        shouldShrinkCatalog,
        setShouldShrinkCatalog
    } = useContext(ExplorationContext);


    const changeHighlight = (startingNodeId: string, reactFlowInstance: ReactFlowInstance<NodeType, EdgeType>, isSourceOfEventCanvas: boolean) => {
        if(!isHighlightingInternallyOn || !isHighlightingOn) {
            return;
        }

        const newVisualIdentifierToSemanticIdentifierMap: Record<string, string> = {};
        const newHighlightLevelsMap = {};

        const reactflowNode = reactFlowInstance.getNode(startingNodeId);
        if(reactflowNode === undefined) {
            return;
        }
        const changingHighlightingForSelection = reactflowNode.selected === true;

        let mainHighlightedNodes: NodeType[];
        if(changingHighlightingForSelection) {
            mainHighlightedNodes = reactFlowInstance.getNodes().filter(node => node.selected === true);
        }
        else {
            mainHighlightedNodes = [reactflowNode];
        }

        const connectedEdges = getConnectedEdges(mainHighlightedNodes, reactFlowInstance.getEdges());
        connectedEdges.forEach(edge => {
            const isSourceInMainHighlight = isInMainHighlight(mainHighlightedNodes, edge.source);
            const otherNodeId = isSourceInMainHighlight ? edge.target : edge.source;
            const otherNode = reactFlowInstance.getNode(otherNodeId);

            if(otherNode === undefined || isInMainHighlight(mainHighlightedNodes, otherNodeId)) {
                return;
            }

            setHighlightLevelDataForNode(otherNode, newVisualIdentifierToSemanticIdentifierMap, newHighlightLevelsMap, 1);
        });

        mainHighlightedNodes.forEach(mainHighlightedNode => {
            setHighlightLevelDataForNode(mainHighlightedNode, newVisualIdentifierToSemanticIdentifierMap, newHighlightLevelsMap, 0);
        });

        setSemanticToVisualIdentifierMap(newVisualIdentifierToSemanticIdentifierMap);
        setHighlightLevels(newHighlightLevelsMap);
        setShouldShrinkCatalog(isSourceOfEventCanvas);
    };

    const resetHighlight = () => {
        if(!isHighlightingInternallyOn || !isHighlightingOn) {
            return;
        }

        setHighlightLevels({});
    };

    const disableTemporarily = () => {
        if (!isHighlightingInternallyOn) {
            return;
        }

        setIsHighlightingInternallyOn(false);
    };

    const enableTemporarily = () => {
        if (isHighlightingInternallyOn) {
            return;
        }

        setIsHighlightingInternallyOn(true);
    };

    const isHighlightingPresent = () => {
        return isHighlightingChangeAllowed() && Object.keys(highlightLevels).length !== 0;
    };

    const isHighlightingChangeAllowed = () => {
        return isHighlightingOn && isHighlightingInternallyOn;
    }

    return {
        highlightLevels, resetHighlight, changeHighlight,
        disableTemporarily, enableTemporarily,
        isHighlightingPresent,
        toggleHighlighting,
        isHighlightingChangeAllowed,
        semanticToVisualIdentifierMap,
        shouldShrinkCatalog,
        isHighlightingOn,
    };
}
