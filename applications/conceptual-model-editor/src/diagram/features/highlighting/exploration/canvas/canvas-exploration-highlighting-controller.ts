import "./canvas-exploration-highlighting-styles.css";
import "../context/exploration-highlighting-styles.css";
import { useEffect } from "react";
import { useExploration } from "../context/highlighting-exploration-mode";
import { Edge, getConnectedEdges, Node } from "@xyflow/react";
import { highlightColorMap, HighlightLevel } from "../../set-selection-highlighting-styles";
import { selectMarkerEnd } from "../../../../diagram-controller";
import { ReactPrevSetStateType } from "../../../../utilities";

// TODO RadStr: Try to unify with the selection highlighting (so probably change to classnames too)
// TODO RadStr: Probably somehow disable the selection highlighting when the exploration mode is on -
//              respectively do it through the classnames - and in here remove it in the replace part
//              It will be the same thing almost - just without the transitions (it will be additional something like classname-highlighting and classname-highlighting-animation)
// TODO RadStr: when it comes to performance - https://web.dev/articles/animations-guide - so if I understand it correctly the opacity and transform are cheap
//              (Does it apply only when I change classname or also just when setting style? or is the setting of any of those expensive? It probably does)
//              Anyways so based on that we should have the outline always visible and just change its opacity, which means we should probably have
//              some kind of render helper element around node with the correct color and just change its opacity
//              For now just do it like this, the performance can be checked later (we can't do it in pure css since we need to compute the neighbors anyways)
//              So I guess that 2 places take performance - the change of outline (and change of edges' color) and the change of backdrop-filter for catalog
// TODO RadStr: Maybe not optimal algorithm-wise? but can't think of anything much better now

// Also note that we can't use classnames to set styles of edges, we have to use the style property.
// We can use classname to set some properties, but mostly it is ignored, because we are using explicit style anyways to set the stroke property for example
// And we also can't set the style of the label of edge - we would probably have to pass in another property in the data property of edge
// and that it is too complicated with almost nothing to gain
export const useExplorationCanvasHighlightingController = (
    setNodes: ReactPrevSetStateType<Node<any>[]>,
    setEdges: ReactPrevSetStateType<Edge<any>[]>
) => {
    const { highlightLevels, changeHighlight, resetHighlight, enableTemporarily, disableTemporarily, isHighlightingOn } = useExploration();

    useEffect(() => {
        if(Object.keys(highlightLevels).length > 0) {
            // TODO RadStr: Debug
            console.info("highlightLevels in useExplorationCanvasHighlightingController");
            console.info(highlightLevels);

            setNodes(prevNodes => {
                const {highlightedNodes, mainHighlightedNodes} = createHighlightedNodes(prevNodes, highlightLevels);
                setEdgesHighlighting(mainHighlightedNodes, setEdges);
                // Set highlighting of nodes
                return prevNodes.map(prevNode => {
                    const highlightedNode = highlightedNodes.find(node => node.id === prevNode.id);
                    if(highlightedNode !== undefined) {
                        return highlightedNode;
                    }
                    else {
                        const newClassName = replaceClassNameWith(prevNode.className, nodesHighlightingLevelToClassnameMap["highlight-opposite"], true, true);
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
    }, [highlightLevels, isHighlightingOn]);

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

function createHighlightedNodes(nodes: Node<any>[], highlightLevels: Record<string, number>): HighlightedNodesContainers {
    const highlightedNodes: Node[] = [];
    const mainHighlightedNodes: Node[] = [];

    Object.entries(highlightLevels).forEach(([nodeId, level]) => {
        const node = nodes.find(n => n.id === nodeId);
        if(node === undefined) {
            return;
        }

        if(level === 0) {
            highlightedNodes.push({...node, className: replaceClassNameWith(node.className, nodesHighlightingLevelToClassnameMap[0], true, true)});
            mainHighlightedNodes.push(node);
        }
        else if(level === 1) {
            highlightedNodes.push({...node, className: replaceClassNameWith(node.className, nodesHighlightingLevelToClassnameMap[1], true, true)});
        }
    });

    return {mainHighlightedNodes, highlightedNodes};
}

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
                animated: true,     // We are using animated property instead of setting color to highlightColorMap[1] (that is black)
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
                        style: {...prevEdge.style, opacity: 0.1}
                    };
                }
                return prevEdge;
            }
        });
    });
}


function resetHighlightingToDefault(
    setNodes: (value: (prevState: Node<any>[]) => Node<any>[]) => void,
    setEdges: (value: (prevState: Edge<any>[]) => Edge<any>[]) => void,
) {
    setEdges(prevEdges => {
        return prevEdges.map(edge => {
            // TODO: CopyPaste of the above and no animation

            if(edge?.data?.color !== undefined) {
                return {
                    ...edge,
                    markerEnd: selectMarkerEnd(edge.data, null),
                    animated: false,
                    style: {...edge.style, opacity: 1}
                };
            }
            return edge;
        });
    });

    setNodes(prevNodes => {
        return prevNodes.map((node) => {
            return {
                ...node,
                className: replaceClassNameWith(node.className, nodesHighlightingLevelToClassnameMap["no-highlight"], true, true),
            };
        });
    });
}


// TODO RadStr: Remove not used stuff


/**
 * @param isReplacingNodeClassNames If set to false then replacing edge class names
 */
const replaceClassNameWith = (
    className: string | undefined,
    replaceClassName: string,
    shouldAddAdditionalAnimation: boolean,
    isReplacingNodeClassNames: boolean,
) => {
    // No quotes for regexp
    const replacedClassname = removeHighlightingClassnames(className ?? null, isReplacingNodeClassNames) + " " + replaceClassName;
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
    const nonAnimationClassNames = ` ${classNamePrefix}-highlight-secondary| ${classNamePrefix}-highlight-main| ${classNamePrefix}-highlight-opposite| ${classNamePrefix}-highlight-classic`;
    const animationClassNames = ` ${classNamePrefix}-highlight-secondary-animation| ${classNamePrefix}-highlight-main-animation| ${classNamePrefix}-highlight-opposite-animation| ${classNamePrefix}-highlight-classic-animation`;
    // Order matters
    return RegExp(animationClassNames + "|" + nonAnimationClassNames, "g");
}


enum RemovalTypes {
    NODE_REMOVAL,
    EDGE_REMOVAL,
};

// Hopefully JS compiler knows that all of this is constant (even though it may not look like it) so it can be remembered (meaning all tehe flow not just this record)
const RegExpForRemoval: Record<RemovalTypes, RegExp> = {
    [RemovalTypes.NODE_REMOVAL]: createRegExpForClassNamesRemoval(true),
    [RemovalTypes.EDGE_REMOVAL]: createRegExpForClassNamesRemoval(false),
};



const highlightOpacityMap: Record<HighlightLevel, number> = {
    "no-highlight": 1,
    0: 1,
    1: 0.3,
    "highlight-opposite": 0.1
};

const nodesHighlightingLevelToStyleMap: Record<HighlightLevel, object> = {
    "no-highlight": {
      outline: undefined,
      opacity: highlightOpacityMap["no-highlight"],
    },
    0: {
      outline: `0.25em solid ${highlightColorMap[0]}`,
      opacity: highlightOpacityMap[0],
    },
    1: {
      outline: `0.25em solid ${highlightColorMap[1]}`,
      opacity: highlightOpacityMap[1],
    },
    "highlight-opposite": {},
};

const nodesHighlightingLevelToClassnameMap: Record<HighlightLevel, string> = {
    "no-highlight": "node-highlight-classic",
    "highlight-opposite": "node-highlight-opposite",
    0: "node-highlight-main",
    1: "node-highlight-secondary",
};

const edgesHighlightingLevelToClassnameMap: Record<HighlightLevel, string> = {
    "no-highlight": "edge-highlight-classic",
    "highlight-opposite": "edge-highlight-opposite",
    0: "edge-highlight-main",
    1: "edge-highlight-secondary",
};

const edgesHighlightingLevelToStyleMap: Record<HighlightLevel, object> = {
    "no-highlight": {
        stroke: null,
        opacity: highlightOpacityMap["no-highlight"],
    },
    0: {
        stroke: highlightColorMap[0],
        opacity: highlightOpacityMap[0],
    },
    1: {
        stroke: highlightColorMap[1],
        opacity: highlightOpacityMap[1],
    },
    "highlight-opposite": {},
};
