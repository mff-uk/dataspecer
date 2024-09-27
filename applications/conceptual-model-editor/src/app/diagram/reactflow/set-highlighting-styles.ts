import { Dispatch, SetStateAction } from "react";
import { Edge, getConnectedEdges, MarkerType, Node } from "reactflow";

// Prototype implementation without classNames just straight up setting styles
export const setHighlightingStylesBasedOnSelection = (nodes: Node<any, string | undefined>[], edges: Edge<any>[],
                                                        setNodes: Dispatch<SetStateAction<Node<any, string | undefined>[]>>,
                                                        setEdges: Dispatch<SetStateAction<Edge<any>[]>>) => {

    const color = "black";
    const highlightColor = "rgba(238, 58, 115, 1)";


    setEdges(prevEdges => {
        const changedNodesBasedOnEdgeSelection: string[] = [];

        // Reset edges style
        prevEdges.forEach(edge => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            edge.style = {...edge.style, stroke: edge.data?.bgColor ?? undefined };
            const arrowType = (edge.markerEnd as unknown as {type: string})?.["type"] ?? "arrow";      // TODO: CopyPaste
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            edge.markerEnd = { type: arrowType === "arrow" ? MarkerType.Arrow : MarkerType.ArrowClosed, height: 20, width: 20, color: edge.data?.bgColor || "maroon" };
        });

        // Set style of edges going from selected nodes
        nodes.forEach(node => {
            const connectedEdges = getConnectedEdges([node], prevEdges);
            connectedEdges.forEach(edge => {
                edge.style = {...edge.style, stroke: color};
                const arrowType = (edge.markerEnd as unknown as {type: string})?.["type"] ?? "arrow";      // TODO: CopyPaste
                edge.markerEnd = { type: arrowType === "arrow" ? MarkerType.Arrow : MarkerType.ArrowClosed, height: 20, width: 20, color: color };
            });
        });

        // Set style of selected edges
        edges.forEach(selectedEdge => {
            const edge = prevEdges.find(prevEdge => prevEdge.id === selectedEdge.id);
            if(edge === undefined) {
                return;
            }
            edge.style = {...edge.style, stroke: highlightColor};
            const arrowType = (edge.markerEnd as unknown as {type: string})?.["type"] ?? "arrow";      // TODO: CopyPaste
            edge.markerEnd = { type: arrowType === "arrow" ? MarkerType.Arrow : MarkerType.ArrowClosed, height: 20, width: 20, color: highlightColor };
            changedNodesBasedOnEdgeSelection.push(edge.source);
            changedNodesBasedOnEdgeSelection.push(edge.target);
        });


        // Set style of nodes
        setNodes(prevNodes => prevNodes.map(node => {
            const isChanged = changedNodesBasedOnEdgeSelection.find(nodeId => nodeId === node.id);
            const isHighlighted = nodes.find(n => node.id === n.id) !== undefined;
            if(isHighlighted) {
                node.style = {
                    ...node.style,
                    backgroundColor: highlightColor,
                };
            }
            else if(isChanged !== undefined) {
                node.style = {
                    ...node.style,
                    backgroundColor: color,
                };
            }
            else {
                node.style = {
                    ...node.style,
                    backgroundColor: "rgba(0, 0, 0, 0)",        // Reset to empty background
                };
            }
            return {...node};
        }));


        return prevEdges.map(e => ({...e}));
    });
}