import { Edge, getConnectedEdges, MarkerType, Node, ReactFlowInstance } from "@xyflow/react";
import { Dispatch, SetStateAction } from "react";
import { NodeType, selectMarkerEnd } from "../../diagram-controller";
import { nodesHighlightingLevelToClassnameMap, replaceClassNameWith } from "./exploration/canvas/canvas-exploration-highlighting-controller";

// TODO RadStr: Improve the dispatch types
export const setHighlightingStylesBasedOnSelection = (
    reactflowInstance: ReactFlowInstance<any, any>,
    nodes: string[],
    edges: string[],
    setNodes: Dispatch<SetStateAction<NodeType[]>>,
    setEdges: Dispatch<SetStateAction<Edge<any>[]>>
) => {
    const highlightColor = highlightColorMap[0];
    const nextToHighlightedElementColor = highlightColorMap[1];

    setEdges(prevEdges => {
        const changedNodesBasedOnEdgeSelection: string[] = [];
        // Reset edges style
        prevEdges.forEach(edge => {
            edge.style = {...edge.style, stroke: edge.data.color };
            edge.markerEnd = selectMarkerEnd(edge.data, null);
        });
        // Set style of edges going from selected nodes
        nodes.forEach(nodeIdentifier => {
            const reactflowNode = reactflowInstance.getNode(nodeIdentifier);
            const connectedEdges = getConnectedEdges([reactflowNode], prevEdges);
            connectedEdges.forEach(edge => {
                edge.style = {...edge.style, stroke: nextToHighlightedElementColor};
                edge.markerEnd = selectMarkerEnd(edge.data, nextToHighlightedElementColor);
            });
        });
        // Set style of selected edges
        edges.forEach(selectedEdgeId => {
            const edge = prevEdges.find(prevEdge => prevEdge.id === selectedEdgeId);
            if(edge === undefined) {
                return;
            }
            edge.style = {...edge.style, stroke: highlightColor};
            edge.markerEnd = selectMarkerEnd(edge.data, highlightColor);
            changedNodesBasedOnEdgeSelection.push(edge.source);
            changedNodesBasedOnEdgeSelection.push(edge.target);
        });
        // Set style of nodes
        setNodes(prevNodes => prevNodes.map(node => {
            const isChanged = changedNodesBasedOnEdgeSelection.find(nodeId => nodeId === node.id);
            const isHighlighted = nodes.find(id => node.id === id) !== undefined;

            // Commented the code with classnames - we unfortunately have to use the style property, because for some reason
            // the classname property takes effect only after something happens (for example user moves the viewport)
            // This fact actually also takes effect in the exploration highlighting mode - When user selects new class
            // using ctrl-selection then when the user doesn't do anything else, the node is not highlighting
            // (after sure for example moves the viewport, it is highlighted again)
            if(isHighlighted) {
                // node.className = replaceClassNameWith(node.className, nodesHighlightingLevelToClassnameMap[0], false, true);
                node.style = {
                    ...node.style,
                    outline: `0.25em solid ${highlightColor}`,
                    // boxShadow: `0 0 0.25em 0.25em ${highlightColor}`         // Alternative to outline
                };
            }
            else if(isChanged !== undefined) {
                // node.className = replaceClassNameWith(node.className, nodesHighlightingLevelToClassnameMap[1], false, true);
                node.style = {
                    ...node.style,
                    outline: `0.25em solid ${nextToHighlightedElementColor}`,
                    // boxShadow: `0 0 0.25em 0.25em ${color}`         // Alternative to outline
                };
            }
            else {
                // node.className = replaceClassNameWith(node.className, nodesHighlightingLevelToClassnameMap["no-highlight"], false, true);
                node.style = {
                    ...node.style,
                    outline: undefined,
                    // boxShadow: undefined                         // Alternative to outline
                };
            }
            return {...node};
        }));

        prevEdges.forEach(e => {
            if(edges.find(id => id === e.id) !== undefined) {
                e.style = {...e.style, stroke: highlightColor};
            }
        });
        // TODO RadStr: Possible optimization is to create copy of only those edges, which actually changed style ... same for nodes
        return prevEdges.map(e => ({...e}));
    });
};

export type HighlightLevel = 0 | 1 | "no-highlight" | "highlight-opposite";

export const highlightColorMap: Record<HighlightLevel, string> = {
  "no-highlight": "rgba(0, 0, 0, 0)",
  "highlight-opposite": "rgba(0, 0, 0, 0)",
  0: "rgba(238, 58, 115, 1)",
  1: "rgba(0, 0, 0, 1)",
};
