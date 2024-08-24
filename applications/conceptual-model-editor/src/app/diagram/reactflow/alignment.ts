
import {
    type Edge,
    type Node,
    type ReactFlowInstance,
    type XYPosition,
    Position,
} from "reactflow";
import {  useState, SetStateAction, Dispatch } from "react";
import { binarySearch } from "../util/utils";
import { configuration } from "../application";


const createAlignmentNodeID = (idSuffix: number): string => {
    return `alignment-node${idSuffix}`;
};

const createAlignmentHelperNode = (idSuffix: number, isY: boolean, isLeft?: boolean) => {
    const node: Node = { id: createAlignmentNodeID(idSuffix), data: { label: "" }, position: { x: 0, y: 0 }, hidden: true, draggable: false };
    node.style = { width: 100, height: 100, border: "0px" };
    if(isY) {
        if(isLeft) {
            node.sourcePosition = Position.Right;
        }
        else {
            node.targetPosition = Position.Left;
        }
    }
    return node;
};



const changeNodesVisibilityInReactflow = (nodes: Node[], hide: boolean) => {
    nodes.forEach(n => n.hidden = hide);
};

const createAlignmentEdge = (idSuffix: number): Edge => {
    return {
        id: `alignment-edge-${idSuffix}`,
        source: createAlignmentNodeID(2 * idSuffix),
        target: createAlignmentNodeID(2 * idSuffix + 1),
        type: "straight",
        animated: false,
        zIndex: 1000,
        style: { stroke: "rgb(0, 0, 0)", strokeWidth: 1 },
        focusable: false,

    };
};

export const createAlignmentEdges = (): [Edge, Edge] => {
    return [createAlignmentEdge(0), createAlignmentEdge(1)];
};

export const isAlignmentNodeID = (id: string): boolean => {
    return id.startsWith("alignment-node");
};


// The prototype nodes used for rendering of the alignment
const alignmentHelperNodesX: [Node, Node] = [createAlignmentHelperNode(0, false), createAlignmentHelperNode(1, false)];
const alignmentHelperNodesY: [Node, Node] = [createAlignmentHelperNode(2, true, true), createAlignmentHelperNode(3, true, false)];



export const useAlignment = (props: {
    reactFlowInstance: ReactFlowInstance<any, any>,
    setNodes: Dispatch<SetStateAction<Node<any, string | undefined>[]>>,
}) => {
    const { reactFlowInstance, setNodes } = props;

    const [nodesSortedByX, setNodesSortedByX] = useState<[string, number][]>([]);
    const [nodesSortedByY, setNodesSortedByY] = useState<[string, number][]>([]);
    // The actual node that made us do the alignment
    const [xAlignmentNode, setXAlignmentNode] = useState<Node | null>(null);
    const [yAlignmentNode, setYAlignmentNode] = useState<Node | null>(null);

    const [mouseEventOffsetFromNodeOnScreen, setMouseEventOffsetFromNodeOnScreen] = useState<[number, number]>([0, 0]);


    const onReset = () => {
        setNodes(prev => {
            changeAlignmentHelperNodesVisibility(true, true, true);
            return alignmentHelperNodesX.concat(alignmentHelperNodesY).concat(prev.filter(n => !isAlignmentNodeID(n.id)));
       });
    };



    const changeAlignmentHelperNodesVisibility = (hideX: boolean, hideY: boolean, hide: boolean) => {
        if(hideX) {
            changeNodesVisibilityInReactflow(alignmentHelperNodesX, hide);
        }
        if(hideY) {
            changeNodesVisibilityInReactflow(alignmentHelperNodesY, hide);
        }
    };

    const convertMouseEventPositionToNodePosition = (event: React.MouseEvent): XYPosition => {
        const nodePosOnScreen = {
            x: event.clientX + mouseEventOffsetFromNodeOnScreen[0],
            y: event.clientY + mouseEventOffsetFromNodeOnScreen[1]
        };
        const nodePosOnCanvas = reactFlowInstance?.screenToFlowPosition(nodePosOnScreen);
        return { x: nodePosOnCanvas.x, y: nodePosOnCanvas.y };
    };

    const isInRange = (value: number, midPoint: number, range: number) => {
        return value > midPoint - range && value < midPoint + range;
    };


    const alignmentSetUpOnNodeDragStart = (event: React.MouseEvent, node: Node) => {
        const nodeScreenPosition = reactFlowInstance.flowToScreenPosition(node.positionAbsolute as XYPosition);
        setMouseEventOffsetFromNodeOnScreen([
            nodeScreenPosition.x as number - event.clientX,
            nodeScreenPosition.y as number - event.clientY,
        ]);


        const nodesOnCanvas = reactFlowInstance.getNodes().filter(n => !(n.id === node.id || isAlignmentNodeID(n.id)));

        const xNodes: [string, number][] = nodesOnCanvas.map(n => {
            return [n.id, n.positionAbsolute?.x ?? -100];
        });
        const yNodes: [string, number][] = nodesOnCanvas.map(n => {
            return [n.id, n.positionAbsolute?.y ?? -100];
        });

        const comparator = (a: [string, number], b: [string, number]) => a[1] - b[1];
        xNodes.sort(comparator);
        yNodes.sort(comparator);
        setNodesSortedByX(xNodes);
        setNodesSortedByY(yNodes);
    };

    const alignmentCleanUpOnNodeDragStop = (node: Node) => {
        node.positionAbsolute = {
            x: xAlignmentNode?.positionAbsolute?.x ?? node.positionAbsolute?.x ?? 20,
            y: yAlignmentNode?.positionAbsolute?.y ?? node.positionAbsolute?.y ?? 10
        };
        setNodes(prev => {
            const hideAlignmentNodes = () => {
                // The order of concat doesn't matter that much, but it is better to keep that alignment nodes at the start of array.
                return (prev.filter(n => isAlignmentNodeID(n.id)).map(n => ({...n, hidden: true})) as Node[]).concat(prev.filter(n => !isAlignmentNodeID(n.id)));
            };
            return hideAlignmentNodes();
        });
        setXAlignmentNode(null);
        setYAlignmentNode(null);
    };

    type Coordinate = "x" | "y";
    type RelevantAlignmentDataForCoordinate = {
        alignmentNode: Node | null,
        setAlignmentNode: Dispatch<SetStateAction<Node | null>>,
        sortedNodes: [string, number][],
        alignmentHelperNodes: [Node, Node],
        alignmentSnapGrid: number
    };


    const alignmentOnNodeDrag = (event: React.MouseEvent, node: Node) => {
        // We first define the methods for the alignment algorithm, then the algorithm itself


        const getRelevantDataForCoordinate = (coordinate: Coordinate): RelevantAlignmentDataForCoordinate => {
            if(coordinate === "x") {
                const { alignmentXSnapGrid } = configuration();
                return {
                    alignmentNode: xAlignmentNode,
                    setAlignmentNode: setXAlignmentNode,
                    sortedNodes: nodesSortedByX,
                    alignmentHelperNodes: alignmentHelperNodesX,
                    alignmentSnapGrid: alignmentXSnapGrid,
                };
            }
            else {
                const { alignmentYSnapGrid } = configuration();
                return {
                    alignmentNode: yAlignmentNode,
                    setAlignmentNode: setYAlignmentNode,
                    sortedNodes: nodesSortedByY,
                    alignmentHelperNodes: alignmentHelperNodesY,
                    alignmentSnapGrid: alignmentYSnapGrid,
                };
            }
        };


        const setNodeAbsolutePositionBasedOnPreviousAlignment = (nodeToAlign: Node, convertedMousePositionToNodePosition: XYPosition, coordinate: Coordinate) => {
            const { alignmentNode, alignmentSnapGrid } = getRelevantDataForCoordinate(coordinate);
            if(alignmentNode !== null) {
                if(isInRange(convertedMousePositionToNodePosition[coordinate], alignmentNode.positionAbsolute?.[coordinate] as number, alignmentSnapGrid)) {
                    // I think that none of these values should be ever undefined unless there is something under the hood with reactflow, but typescript complains otherwise
                    if(nodeToAlign.positionAbsolute !== undefined && alignmentNode.positionAbsolute !== undefined) {
                        nodeToAlign.positionAbsolute[coordinate] = alignmentNode.positionAbsolute[coordinate];
                    }
                }
            }
        };


        const getOtherCoordinate = (coordinate: Coordinate) => {
            return coordinate === "x" ? "y" : "x";
        };


        const createNewAlignmentHelperNodesFromOld = (coordinate: Coordinate, coordinatePosition: number): [Node, Node] => {
            // We have to change the helper nodes even though they are used as prototypes. If we do not do that reactflow does some weird flickering even when they are hidden.
            // (Meaning that if we don't change the prototypes at all, keep them hidden all the time and only work with copies. ... but maybe it was related to something else, I don't know now)
            const otherCoordinate = getOtherCoordinate(coordinate);
            const { alignmentHelperNodes } = getRelevantDataForCoordinate(coordinate);
            const { sortedNodes: otherCoordinateSortedNodes } = getRelevantDataForCoordinate(otherCoordinate);


            const otherCoordinatePositionForFirstNode = otherCoordinateSortedNodes[0]?.[1] as number - 1000;        // Top y for x coordinate, left x for y coordinate
            alignmentHelperNodes[0].position[coordinate] = coordinatePosition;
            alignmentHelperNodes[0].position[otherCoordinate] = otherCoordinatePositionForFirstNode;
            alignmentHelperNodes[0].positionAbsolute = {        // Have to create the object separately, TS doesn't recognize that we are passing in x and y through Coordinate type
                x: 0,
                y: 0
            };
            alignmentHelperNodes[0].positionAbsolute[coordinate] = coordinatePosition;
            alignmentHelperNodes[0].positionAbsolute[otherCoordinate] = otherCoordinatePositionForFirstNode;
            alignmentHelperNodes[0].hidden = false;

            // Same as the "top" one
            const otherCoordinatePositionForSecondNode = otherCoordinateSortedNodes[otherCoordinateSortedNodes.length - 1]?.[1] as number + 1000;   // Bot y for x coordinate, left x for y coordinate
            alignmentHelperNodes[1].position[coordinate] = coordinatePosition;
            alignmentHelperNodes[1].position[otherCoordinate] = otherCoordinatePositionForSecondNode;
            alignmentHelperNodes[1].positionAbsolute = {
                x: 0,
                y: 0
            };
            alignmentHelperNodes[0].positionAbsolute[coordinate] = coordinatePosition;
            alignmentHelperNodes[0].positionAbsolute[otherCoordinate] = otherCoordinatePositionForSecondNode;
            alignmentHelperNodes[1].hidden = false;

            return [{...alignmentHelperNodes[0]}, {...alignmentHelperNodes[1]}];
        };


        const checkForAlignment = (absolutePosition: XYPosition, coordinate: Coordinate, changedAlignmentNodes: Node[]): [boolean, number] => {
            const { alignmentNode, setAlignmentNode, sortedNodes, alignmentHelperNodes } = getRelevantDataForCoordinate(coordinate);
            const indexInSortedArray = binarySearch(sortedNodes, absolutePosition[coordinate]);


            // We are are aligning and weren't or were but to a different position
            if(indexInSortedArray >= 0 && (alignmentNode === null || absolutePosition[coordinate] !== alignmentNode.positionAbsolute?.[coordinate])) {
                setAlignmentNode(reactFlowInstance.getNode(sortedNodes[indexInSortedArray]?.[0] as string) ?? null);
                const offsetForHandler = 4;
                const relevantDimension: "width" | "height" = coordinate === "x" ? "width" : "height";
                const coordinatePositionForAlignmentHelperNodes = sortedNodes[indexInSortedArray]?.[1] as number - (alignmentHelperNodes[0].style?.[relevantDimension] as number / 2) + offsetForHandler;

                const [firstNode, secondNode] = createNewAlignmentHelperNodesFromOld(coordinate, coordinatePositionForAlignmentHelperNodes);
                changedAlignmentNodes.push(firstNode);
                changedAlignmentNodes.push(secondNode);

                return [false, indexInSortedArray];
            }
            else if(indexInSortedArray < 0 && alignmentNode !== null) {    // We were aligning and we no longer are
                setAlignmentNode(null);
                changeAlignmentHelperNodesVisibility(coordinate === "x", coordinate === "y", true);
                changedAlignmentNodes.push({...alignmentHelperNodes[0]});
                changedAlignmentNodes.push({...alignmentHelperNodes[1]});

                return [true, indexInSortedArray];
            }

            return [false, indexInSortedArray];
        };



        // To describe the algorithm:
        // We first check if there was already some alignment present and try to set positions based on that
        // Then we check if the position (aligned if there was the alignment) aligns with some node
        // Either it doesn't and it did, so we remove the alignment or it does and wasn't, so we add it.
        // We do the same for x and y coordinates
        // In the end we update the nodes through setNodes if necessary.
        const alignedNodeCopy: Node = { ...node };
        const isAlignmentNewlyOver = {
            x: false,
            y: false,
        };
        const convertedMousePositionToNodePosition = convertMouseEventPositionToNodePosition(event);

        setNodeAbsolutePositionBasedOnPreviousAlignment(alignedNodeCopy, convertedMousePositionToNodePosition, "x");
        setNodeAbsolutePositionBasedOnPreviousAlignment(alignedNodeCopy, convertedMousePositionToNodePosition, "y");

        const position = alignedNodeCopy.positionAbsolute;
        if(position === undefined) {
            return;
        }

        const changedAlignmentNodes: Node[] = [];
        const indexInSortedArray = {
            x: -1,
            y: -1
        };
        [isAlignmentNewlyOver.x, indexInSortedArray.x] = checkForAlignment(position, "x", changedAlignmentNodes);
        [isAlignmentNewlyOver.y, indexInSortedArray.y] = checkForAlignment(position, "y", changedAlignmentNodes);


        // If we were aligning at least one node and still are
        if(changedAlignmentNodes.length === 0 && (indexInSortedArray.x >= 0 || indexInSortedArray.y >= 0)) {
            node.position!.x = alignedNodeCopy.positionAbsolute!.x;
            node.position!.y = alignedNodeCopy.positionAbsolute!.y;
            node.positionAbsolute!.x = alignedNodeCopy.positionAbsolute!.x;
            node.positionAbsolute!.y = alignedNodeCopy.positionAbsolute!.y;
            return;
        }

        if(changedAlignmentNodes.length > 0) {
            setNodes((previousNodes) => {
                if(isAlignmentNewlyOver.x) {
                    alignedNodeCopy.positionAbsolute!.x = node.positionAbsolute!.x;
                }
                if(isAlignmentNewlyOver.y) {
                    alignedNodeCopy.positionAbsolute!.y = node.positionAbsolute!.y;
                }

                // If True, then it means that only the moved node changed position
                const isAlignmentSame = changedAlignmentNodes.reduce(
                    (accumulator, possiblyChangedAlignmentNode) => {
                        const currAlignmentNodeOnCanvas = previousNodes.find(n => n.id === possiblyChangedAlignmentNode.id);
                        return accumulator && currAlignmentNodeOnCanvas?.hidden === possiblyChangedAlignmentNode.hidden &&
                                currAlignmentNodeOnCanvas?.positionAbsolute?.x === possiblyChangedAlignmentNode?.positionAbsolute?.x &&
                                currAlignmentNodeOnCanvas?.positionAbsolute?.y === possiblyChangedAlignmentNode?.positionAbsolute?.y;
                    }, true);


                // If True, then we can only set the position of the node and move on. Reactflow expects the node position to change,
                // so we don't have to explicitly create new object to inform about change.
                // This should slightly improve performance (at least I believe that should be the case).

                // TODO: Actually this case most likely never occurs, I was checking for undefined instead of null sooner in the code, so I got incorrect values here
                if(isAlignmentSame) {
                    node.position!.x = alignedNodeCopy.positionAbsolute!.x;
                    node.position!.y = alignedNodeCopy.positionAbsolute!.y;
                    node.positionAbsolute!.x = alignedNodeCopy.positionAbsolute!.x;
                    node.positionAbsolute!.y = alignedNodeCopy.positionAbsolute!.y;
                    return previousNodes;
                }

                alignedNodeCopy.position = {...alignedNodeCopy.positionAbsolute ?? alignedNodeCopy.position};


                const replaceDraggedNodeAndChangedAlignmentNodes = () => (
                    changedAlignmentNodes.concat(previousNodes.filter(n => changedAlignmentNodes.find(nn => n.id === nn.id) === undefined)
                                                                .filter(n => n.id !== node.id)
                                                                .concat([
                                                                    alignedNodeCopy
                                                                ])
                                                )
                );

                return replaceDraggedNodeAndChangedAlignmentNodes();
            });
        }
    };

    return {
        onReset,
        alignmentSetUpOnNodeDragStart,
        alignmentOnNodeDrag,
        alignmentCleanUpOnNodeDragStop
    };
};