import { Edge, getConnectedEdges, MarkerType, Node, ReactFlowInstance } from "@xyflow/react";
import { Dispatch, SetStateAction } from "react";
import { NodeType } from "../../diagram-controller";

// TODO RadStr: Improve the dispatch types
export const setHighlightingStylesBasedOnSelection = (
    reactflowInstance: ReactFlowInstance<any, any>,
    nodes: string[],
    edges: string[],
    setNodes: Dispatch<SetStateAction<NodeType[]>>,
    setEdges: Dispatch<SetStateAction<Edge<any>[]>>
) => {
    const nextToHighlightedElementColor = "black";
    const highlightColor = "rgba(238, 58, 115, 1)";

    setEdges(prevEdges => {
        const changedNodesBasedOnEdgeSelection: string[] = [];
        // Reset edges style
        prevEdges.forEach(edge => {
            edge.style = {...edge.style, stroke: edge.data?.color ?? undefined };
            setMarkerEndForEdge(edge, edge.data?.color ?? "maroon");
        });
        // Set style of edges going from selected nodes
        nodes.forEach(nodeIdentifier => {
            const reactflowNode = reactflowInstance.getNode(nodeIdentifier);
            const connectedEdges = getConnectedEdges([reactflowNode], prevEdges);
            connectedEdges.forEach(edge => {
                edge.style = {...edge.style, stroke: nextToHighlightedElementColor};
                setMarkerEndForEdge(edge, nextToHighlightedElementColor);
            });
        });
        // Set style of selected edges
        edges.forEach(selectedEdgeId => {
            const edge = prevEdges.find(prevEdge => prevEdge.id === selectedEdgeId);
            if(edge === undefined) {
                return;
            }
            edge.style = {...edge.style, stroke: highlightColor};
            setMarkerEndForEdge(edge, highlightColor);
            changedNodesBasedOnEdgeSelection.push(edge.source);
            changedNodesBasedOnEdgeSelection.push(edge.target);
        });
        // Set style of nodes
        setNodes(prevNodes => prevNodes.map(node => {
            const isChanged = changedNodesBasedOnEdgeSelection.find(nodeId => nodeId === node.id);
            const isHighlighted = nodes.find(id => node.id === id) !== undefined;

            if(isHighlighted) {
                node.style = {
                    ...node.style,

                    outline: `0.25em solid ${highlightColor}`,
                    // boxShadow: `0 0 0.25em 0.25em ${highlightColor}`         // Alternative to outline
                };
            }
            else if(isChanged !== undefined) {
                node.style = {
                    ...node.style,

                    outline: `0.25em solid ${nextToHighlightedElementColor}`,
                    // boxShadow: `0 0 0.25em 0.25em ${color}`         // Alternative to outline
                };
            }
            else {
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

// TODO RadStr: Can be done better by using the already existing method for marker ends
function setMarkerEndForEdge(edge: Edge<any>, color: string) {
    const arrowType = (edge.markerEnd as unknown as {type: string})?.["type"] ?? "arrow";
    edge.markerEnd = { type: arrowType === "arrow" ? MarkerType.Arrow : MarkerType.ArrowClosed, height: 20, width: 20, color };
}