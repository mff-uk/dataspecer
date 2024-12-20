import "./canvas-exploration-highlighting-styles.css";
import "../context/exploration-highlighting-styles.css";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useExploration } from "../context/highlighting-exploration-mode";
import { Edge, getConnectedEdges, MarkerType, Node } from "@xyflow/react";

// TODO RadStr: Better types
// TODO RadStr: Split into more methods
// TODO RadStr: maybe rename?
// TODO RadStr: use methods to change the edge marker type
// TODO RadStr: Try to unify with the selection highlighting (so probably change to classnames too)
// TODO RadStr: Probably somehow disable the selection highlighting when the exploration mode is on
// TODO RadStr: Clean-up the css files
export const useCanvasHighlightingController = (
    setNodes: (value: SetStateAction<Node<any>[]>) => void,
    setEdges: Dispatch<SetStateAction<Edge<any>[]>>
) => {
    const { highlightLevels, changeHighlight, resetHighlight, enableTemporarily, disableTemporarily } = useExploration();

    useEffect(() => {
        if(Object.keys(highlightLevels).length > 0) {
            // TODO RadStr: Debug
            console.info("highlightLevels in useCanvasHighlightingController");
            console.info(highlightLevels);

            setNodes(prev => {
                const highlightedNodes: Node[] = [];
                let mainHighlightedNode: Node;

                // TODO RadStr: Can be put inside return prev.map and we will save 1 find
                Object.entries(highlightLevels).forEach(([nodeId, level]) => {
                    const node = prev.find(n => n.id === nodeId);
                    if(node === undefined) {
                        return;
                    }

                    if(level === 0) {
                        // TODO RadStr: Debug
                        console.log("MAIN: " + String(node.className));
                        highlightedNodes.push({...node, className: ((node.className?.replace(/ node-highlight-classic/g, "") ?? "") + " node-highlight-main")});
                        mainHighlightedNode = node;
                    }
                    else if(level === 1) {
                        // TODO RadStr: Debug
                        console.log("SECONDARY: " + String(node.className));
                        highlightedNodes.push({...node, className: ((node.className?.replace(/ node-highlight-classic/g, "") ?? "") + " node-highlight-secondary")});
                    }
                });


                setEdges(prev => {
                    const connectedEdges = getConnectedEdges([mainHighlightedNode], prev);
                    const highlightedEdges: Edge[] = [];
                    connectedEdges.forEach(edge => {
                        const arrowType: string = (edge.markerEnd as unknown as {type: string})?.["type"] ?? "arrow";
                        highlightedEdges.push({
                            ...edge,
                            style: {...edge.style, stroke: "black"},
                            markerEnd: { type: arrowType === "arrow" ? MarkerType.Arrow : MarkerType.ArrowClosed, height: 20, width: 20, color: "black" },
                        });
                    });

                    return prev.map(e => {
                        const ee = highlightedEdges.find((eee) => eee.id === e.id);
                        if(ee !== undefined) {
                            return ee;
                        }
                        else {
                            if(e?.data?.color !== undefined) {
                                const arrowType = (e.markerEnd as unknown as {type: string})?.["type"] ?? "arrow";
                                return {
                                    ...e,
                                    markerEnd: { type: arrowType === "arrow" ? MarkerType.Arrow : MarkerType.ArrowClosed, height: 20, width: 20, color: e.data.color },
                                    style: {...e.style, stroke: e.data.color, opacity: 0.1}
                                };
                            }
                            return e;
                        }
                    });
                });

                return prev.map(n => {
                    const nn = highlightedNodes.find((nnn) => nnn.id === n.id);
                    if(nn !== undefined) {
                        return nn;
                    }
                    else {
                        return {
                            ...n,
                            className: ((n.className?.replace(/ node-highlight-classic/g, "") ?? "") + " highlight-opposite"),
                        };
                    }
                });
            });
        }
        // Clean up
        return () => {
            setEdges(prev => {
                return prev.map(e => {
                    // TODO: CopyPaste of the above and no animation

                    if(e?.data?.color !== undefined) {
                        const arrowType = (e.markerEnd as unknown as {type: string})?.["type"] ?? "arrow";      // TODO: CopyPaste
                        return {
                            ...e,
                            markerEnd: { type: arrowType === "arrow" ? MarkerType.Arrow : MarkerType.ArrowClosed, height: 20, width: 20, color: e.data.color },
                            style: {...e.style, stroke: e.data.color, opacity: 1}
                        };
                    }
                    return e;
                });
            });

            setNodes(prev => {
                return prev.map((n) => {
                    return {
                        ...n,
                        // !!! no quotes for regexp
                        className: (n.className?.replace(/ node-highlight-secondary| node-highlight-main| highlight-opposite| node-highlight-classic/g, "") ?? "") + " node-highlight-classic",
                    };
                });
            });
        };
    }, [highlightLevels]);

    return {
        changeHighlight,
        resetHighlight,
        enableTemporarily,
        disableTemporarily
    };
};