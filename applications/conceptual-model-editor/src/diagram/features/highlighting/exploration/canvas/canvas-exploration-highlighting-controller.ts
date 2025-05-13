import "./canvas-exploration-highlighting-styles.css";
import "../shared-style/exploration-highlighting-styles.css";
import { useEffect } from "react";
import { useExploration } from "../../../../../context/highlighting-exploration-mode";
import { Edge, Node, ReactFlowInstance, getConnectedEdges } from "@xyflow/react";
import { HighlightLevel, highlightColorMap } from "../../set-selection-highlighting-styles";
import { EdgeType, NodeType, selectMarkerEnd } from "../../../../diagram-controller";
import { ReactPrevSetStateType } from "../../../../utilities";

// When it comes to performance - https://web.dev/articles/animations-guide -
// so if I understand it correctly the opacity and transform are cheap
// (Does it apply only when I change classname or also just when setting style?
// or is the setting of any of those expensive? It probably does)
// Anyways so based on that we should have the outline always visible and just change its opacity,
// which means we should probably have
// some kind of render helper element around node with the correct color and just change its opacity
// For now just do it like this, the performance can be checked later
// (we can't do it in pure css since we need to compute the neighbors anyways)
// So I guess that 2 places take performance -
// the change of outline (and change of edges' color) and the change of backdrop-filter for catalog

// Also note that we can't use classnames to set styles of edges,
// we have to use the style property. And transitions/animations are straight up ignored.
// We can use classname to set some properties, but mostly it is ignored,
// because we are using explicit style anyways to set the stroke property for example
// And we also can't set the style of the label of edge -
// we would probably have to pass in another property in the data property of edge
// and that it is too complicated with almost nothing to gain

/**
 * The controller of highlighting exploration mode for canvas.
 */
export const useExplorationCanvasHighlightingController = (
  setNodes: ReactPrevSetStateType<Node<any>[]>,
  setEdges: ReactPrevSetStateType<Edge<any>[]>
) => {
  const {
    highlightLevels,
    resetHighlight,
    enableTemporarily,
    disableTemporarily,
    isHighlightingOn,
    isHighlightingChangeAllowed,
    setHighlightLevels,
    setSemanticToVisualIdentifierMap,
    setShouldShrinkCatalog
  } = useExploration();

  /**
   * Changes the state of context to signalize change in highlighting.
   */
  const changeHighlight = (
    startingNodesIdentifiers: string[],
    reactFlowInstance: ReactFlowInstance<NodeType, EdgeType>,
    isSourceOfEventCanvas: boolean,
    _modelOfClassWhichStartedHighlighting: string | null
  ) => {
    if(!isHighlightingChangeAllowed()) {
      return;
    }

    const newVisualIdentifierToSemanticIdentifierMap: Record<string, string> = {};
    const newHighlightLevelsMap = {};
    const mainHighlightedNodes: NodeType[] = [];

    for(const startingNodeIdentifier of startingNodesIdentifiers) {
      const reactflowNode = reactFlowInstance.getNode(startingNodeIdentifier);
      if(reactflowNode === undefined) {
        continue;
      }
      mainHighlightedNodes.push(reactflowNode);
    }

    const connectedEdges = getConnectedEdges(mainHighlightedNodes, reactFlowInstance.getEdges());
    // Setting the style of nodes which are connected to the main (level 0) ones
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
      setHighlightLevelDataForNode(
        mainHighlightedNode, newVisualIdentifierToSemanticIdentifierMap, newHighlightLevelsMap, 0);
    });

    setSemanticToVisualIdentifierMap(newVisualIdentifierToSemanticIdentifierMap);
    setHighlightLevels(newHighlightLevelsMap);
    setShouldShrinkCatalog(isSourceOfEventCanvas);
  };

  useEffect(() => {
    if(Object.keys(highlightLevels).length > 0) {
      setNodes(prevNodes => {
        const { highlightedNodes, mainHighlightedNodes } = createHighlightedNodes(prevNodes, highlightLevels);
        setEdgesHighlighting(mainHighlightedNodes, setEdges);
        // Set highlighting of nodes
        return prevNodes.map(prevNode => {
          const highlightedNode = highlightedNodes.find(node => node.id === prevNode.id);
          if(highlightedNode !== undefined) {
            return highlightedNode;
          }
          else {
            const newClassName = replaceClassNameWith(
              prevNode.className, nodesHighlightingLevelToClassnameMap["highlight-opposite"], true, true);
            if(newClassName === prevNode.className) {
              return prevNode;
            }
            return {
              ...prevNode,
              className: newClassName,
            };
          }
        });
      });
    }
    return () => {
      resetHighlightingToDefault(setNodes, setEdges);
    };
  }, [highlightLevels, isHighlightingOn, setNodes, setEdges]);

  // Reset the possible selection highlighting
  useEffect(() => {
    return () => {
      if(!isHighlightingOn) {
        setNodes(prevNodes => {
          return prevNodes.map(prevNode => {
            return {
              ...prevNode,
              style: { ...prevNode.style, outline: undefined },
            };
          });
        });

        setEdges(prevEdges => {
          return prevEdges.map(edge => {
            return {
              ...edge,
              style: { ...edge.style, stroke: edge.data.color },
            };
          });
        });
      }
    }
  }, [isHighlightingOn, setNodes, setEdges]);

  return {
    changeHighlight,
    resetHighlight,
    enableTemporarily,
    disableTemporarily,
    isHighlightingOn
  };
};

type HighlightedNodesContainers = {
    highlightedNodes: Node[];
    mainHighlightedNodes: Node[];
};

/**
 * Creates copies of the nodes and puts to them to correct style for highlighting.
 */
function createHighlightedNodes(
  nodes: Node<any>[],
  highlightLevels: Record<string, number>
): HighlightedNodesContainers {
  const highlightedNodes: Node[] = [];
  const mainHighlightedNodes: Node[] = [];

  Object.entries(highlightLevels).forEach(([nodeId, level]) => {
    const node = nodes.find(n => n.id === nodeId);
    if(node === undefined) {
      return;
    }

    if(level === 0) {
      highlightedNodes.push({
        ...node,
        className: replaceClassNameWith(node.className, nodesHighlightingLevelToClassnameMap[0], true, true) });
      mainHighlightedNodes.push(node);
    }
    else if(level === 1) {
      highlightedNodes.push({
        ...node,
        className: replaceClassNameWith(node.className, nodesHighlightingLevelToClassnameMap[1], true, true) });
    }
  });

  return { mainHighlightedNodes, highlightedNodes };
}

/**
 * Sets the style of edges based on {@link mainHighlightedNodes}.
 */
function setEdgesHighlighting(
  mainHighlightedNodes: Node[],
  setEdges: (value: (prevState: Edge<any>[]) => Edge<any>[]) => void,
): void {
  setEdges(prevEdges => {
    const connectedEdges = getConnectedEdges(mainHighlightedNodes, prevEdges);
    const highlightedEdges: Edge[] = [];
    connectedEdges.forEach(edge => {
      highlightedEdges.push({
        ...edge,
        // We are using animated property instead of setting color to highlightColorMap[1] (that is black)
        animated: true,
        markerEnd: selectMarkerEnd(edge.data, highlightColorMap[1]),
      });
    });

    return prevEdges.map(prevEdge => {
      const highlightedEdge = highlightedEdges.find((edge) => edge.id === prevEdge.id);
      if(highlightedEdge !== undefined) {
        return highlightedEdge;
      }
      else {
        if(prevEdge?.data?.color !== undefined) {
          return {
            ...prevEdge,
            markerEnd: selectMarkerEnd(prevEdge.data, prevEdge.data.color),
            animated: false,
            style: { ...prevEdge.style, opacity: edgeHighlightOpacityMap["highlight-opposite"] }
          };
        }
        return prevEdge;
      }
    });
  });
}

/**
 * Resets the highlighting of entities back to default colors.
 */
function resetHighlightingToDefault(
  setNodes: (value: (prevState: Node<any>[]) => Node<any>[]) => void,
  setEdges: (value: (prevState: Edge<any>[]) => Edge<any>[]) => void,
) {
  setEdges(prevEdges => {
    return prevEdges.map(edge => {
      if(edge?.data?.color !== undefined) {
        return {
          ...edge,
          markerEnd: selectMarkerEnd(edge.data, null),
          animated: false,
          style: { ...edge.style, opacity: edgeHighlightOpacityMap["no-highlight"] }
        };
      }
      return edge;
    });
  });

  setNodes(prevNodes => {
    return prevNodes.map((node) => {
      return {
        ...node,
        className: replaceClassNameWith(
          node.className, nodesHighlightingLevelToClassnameMap["no-highlight"], true, true),
      };
    });
  });
}

/**
 * Returns class name, which removes all the parts related to highlighting
 * and then puts in the the {@link replaceClassName}
 * @param isReplacingNodeClassNames If set to false then replacing edge class names
 */
const replaceClassNameWith = (
  className: string | undefined,
  replaceClassName: string,
  shouldAddAdditionalAnimation: boolean,
  isReplacingNodeClassNames: boolean,
) => {
  // No quotes for regexp
  const replacedClassname = removeHighlightingClassnames(className ?? null, isReplacingNodeClassNames) +
    " " + replaceClassName;
  if(shouldAddAdditionalAnimation) {
    return replacedClassname + ` ${replaceClassName + "-animation"}`;
  }
  return replacedClassname;
}

const removeHighlightingClassnames = (
  className: string | null,
  isReplacingNodeClassNames: boolean,
): string => {
  const keyForRegexMap = isReplacingNodeClassNames ? RemovalTypes.NODE_REMOVAL : RemovalTypes.EDGE_REMOVAL;
  const classnameAfterRemoval = className?.replace(RegExpForRemoval[keyForRegexMap], "") ?? "";
  return classnameAfterRemoval;
}

const createRegExpForClassNamesRemoval = (isReplacingNodeClassNames: boolean) => {
  const classNamePrefix = isReplacingNodeClassNames ? "node" : "edge";
  const nonAnimationClassNames = ` ${classNamePrefix}-highlight-secondary| ${classNamePrefix}-highlight-main| ` +
    `${classNamePrefix}-highlight-opposite| ${classNamePrefix}-highlight-classic`;
  const animationClassNames = ` ${classNamePrefix}-highlight-secondary-animation| ` +
    `${classNamePrefix}-highlight-main-animation| ${classNamePrefix}-highlight-opposite-animation| ` +
    `${classNamePrefix}-highlight-classic-animation`;
  // Order matters
  return RegExp(animationClassNames + "|" + nonAnimationClassNames, "g");
}

enum RemovalTypes {
    NODE_REMOVAL,
    EDGE_REMOVAL,
};

// Hopefully JS compiler knows that all of this is constant (even though it may not look like it)
// so it can be remembered (meaning all tehe flow not just this record)
const RegExpForRemoval: Record<RemovalTypes, RegExp> = {
  [RemovalTypes.NODE_REMOVAL]: createRegExpForClassNamesRemoval(true),
  [RemovalTypes.EDGE_REMOVAL]: createRegExpForClassNamesRemoval(false),
};

const edgeHighlightOpacityMap: Record<HighlightLevel, number> = {
  "no-highlight": 1,
  0: 1,
  1: 0.3,
  "highlight-opposite": 0.1
};

// Actually probably no need to export, because we are using styles instead of classnames for the highlighting selection
const nodesHighlightingLevelToClassnameMap: Record<HighlightLevel, string> = Object.freeze({
  "no-highlight": "node-highlight-classic",
  "highlight-opposite": "node-highlight-opposite",
  0: "node-highlight-main",
  1: "node-highlight-secondary",
});



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
) => mainHighlightedNodes
  .find(mainHighlightedNode => mainHighlightCandidateIdentifier === mainHighlightedNode.id) !== undefined;
