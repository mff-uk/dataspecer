import { Edge, getConnectedEdges, MarkerType, Node, ReactFlowInstance } from "@xyflow/react";
import { Dispatch, SetStateAction } from "react";
import { NodeType, selectMarkerEnd } from "../../diagram-controller";
import { ReactPrevSetStateType } from "../../utilities";

// TODO RadStr: Improve the dispatch types
export const setHighlightingStylesBasedOnSelection = (
    reactflowInstance: ReactFlowInstance<any, any>,
    nodes: string[],
    edges: string[],
    setNodes: ReactPrevSetStateType<NodeType[]>,
    setEdges: ReactPrevSetStateType<Edge<any>[]>,
) => {
    const highlightColor = highlightColorMap[0];
    const nextToHighlightedElementColor = highlightColorMap[1];

    setEdges(prevEdges => {
        const changedNodesBasedOnEdgeSelection: string[] = [];
        const changedCopiesOfPreviousEdges: Record<string, Edge<any>> = {};
        // Reset edges style
        prevEdges.forEach(edge => {
            storeEdgeCopyToGivenMap(edge, null, changedCopiesOfPreviousEdges);
        });
        // Set style of edges going from selected nodes
        nodes.forEach(nodeIdentifier => {
            const reactflowNode = reactflowInstance.getNode(nodeIdentifier);
            const connectedEdges = getConnectedEdges([reactflowNode], prevEdges);
            connectedEdges.forEach(edge => {
                storeEdgeCopyToGivenMap(edge, nextToHighlightedElementColor, changedCopiesOfPreviousEdges);
            });
        });
        // Set style of selected edges
        edges.forEach(selectedEdgeId => {
            const edge = prevEdges.find(prevEdge => prevEdge.id === selectedEdgeId);
            if(edge === undefined) {
                return;
            }

            storeEdgeCopyToGivenMap(edge, highlightColor, changedCopiesOfPreviousEdges);
            changedNodesBasedOnEdgeSelection.push(edge.source);
            changedNodesBasedOnEdgeSelection.push(edge.target);
        });
        // Set style of nodes
        setNodes(prevNodes => prevNodes.map(node => {
            const isChangedBasedOnSelectedEdge = changedNodesBasedOnEdgeSelection.find(nodeId => nodeId === node.id) !== undefined;
            const isHighlighted = nodes.find(id => node.id === id) !== undefined;

            let newOutline: string | undefined = undefined;
            if(isHighlighted) {
                newOutline = `0.25em solid ${highlightColor}`;
            }
            else if(isChangedBasedOnSelectedEdge) {
                newOutline = `0.25em solid ${nextToHighlightedElementColor}`;
            }
            // Else undefined

            if(newOutline === node.style?.outline) {
                return node;
            }
            return {
                ...node,
                style: {
                    ...node.style,
                    outline: newOutline,
                },
            };
        }));

        return prevEdges.map(edge => {
            return changedCopiesOfPreviousEdges[edge.id].style?.stroke === edge.style?.stroke ? edge : changedCopiesOfPreviousEdges[edge.id];
        });
    });
};

export type HighlightLevel = 0 | 1 | "no-highlight" | "highlight-opposite";

export const highlightColorMap: Record<HighlightLevel, string> = {
  "no-highlight": "rgba(0, 0, 0, 0)",
  "highlight-opposite": "rgba(0, 0, 0, 0)",
  0: "rgba(238, 58, 115, 1)",
  1: "rgba(0, 0, 0, 1)",
};

function storeEdgeCopyToGivenMap(
    edge: Edge<any>, newEdgeColor: string | null,
    changedCopiesOfPreviousEdges: Record<string, Edge<any>>
): void {
    if(newEdgeColor === null) {
        newEdgeColor = edge?.data?.color;
    }

    const changedEdge = changedCopiesOfPreviousEdges[edge.id] ?? ({...edge});
    changedEdge.style = {...changedEdge.style, stroke: newEdgeColor ?? undefined};
    changedEdge.markerEnd = selectMarkerEnd(changedEdge.data, newEdgeColor);
    changedCopiesOfPreviousEdges[changedEdge.id] = changedEdge;
}