import { useState, type SetStateAction, type Dispatch } from "react";
import {
    type Node,
    type ReactFlowInstance,
    type XYPosition,
    type InternalNode,
    type NodeChange,
    type NodePositionChange
} from "@xyflow/react";

import { binarySearch } from "../../util/functions";
import { configuration } from "../../application/configuration";
import { type NodeType } from "../diagram-controller";
import { type Point } from "../edge/math";


// In v12 absolute position isn't exposed in public API anymore, you have use useInternalNode() / getInternalNode ( https://github.com/xyflow/xyflow/discussions/3764 )
// On a side note note I think that we should work with absolute positions, if I understand it correctly positions are relative to the parent node
// (which equals the absolute position if there is no parent node)
// There some places where I probably don't update the absolute position but I should (some of the commented code), so after group nodes will be added, it will have to be fixed
const getInternalNodeFromNode = (node: Node, reactFlowInstance: ReactFlowInstance<any, any>): InternalNode => {
    return reactFlowInstance.getInternalNode(node.id) as InternalNode;
};

type Coordinate = "x" | "y";
type RelevantAlignmentDataForCoordinate = {
    alignmentNode: InternalNode | null,
    setAlignmentNode: Dispatch<SetStateAction<InternalNode | null>>,
    sortedNodes: [string, number][],
    alignmentHelperLine: Point | null,
    setAlignmentHelperLine: Dispatch<SetStateAction<Point | null>>,
    alignmentSnapGrid: number
};

const getOtherCoordinate = (coordinate: Coordinate) => {
    return coordinate === "x" ? "y" : "x";
};

const isInRange = (value: number, midPoint: number, range: number) => {
    return value > midPoint - range && value < midPoint + range;
};

export type AlignmentController = {
    onReset: () => void,
    alignmentSetUpOnNodeDragStart: (node: Node) => void,
    alignmentCleanUpOnNodeDragStop: (node: Node) => void,
    alignmentNodesChange: (changes: NodeChange<NodeType>[]) => void,
    horizontalAlignmentLine: Point | null,
    verticalAlignmentLine: Point | null,
};


export const useAlignmentController = (props: {
    reactFlowInstance: ReactFlowInstance<any, any>,
}): AlignmentController => {
    const { reactFlowInstance } = props;

    const [nodesSortedByX, setNodesSortedByX] = useState<[string, number][]>([]);
    const [nodesSortedByY, setNodesSortedByY] = useState<[string, number][]>([]);
    // The actual node that made us do the alignment
    const [xAlignmentNode, setXAlignmentNode] = useState<InternalNode | null>(null);
    const [yAlignmentNode, setYAlignmentNode] = useState<InternalNode | null>(null);

    const [horizontalAlignmentLine, setHorizontalAlignmentLine] = useState<Point | null>(null);
    const [verticalAlignmentLine, setVerticalAlignmentLine] = useState<Point | null>(null);

    const onReset = () => {
        setHorizontalAlignmentLine(null);
        setVerticalAlignmentLine(null);
        setXAlignmentNode(null);
        setYAlignmentNode(null);
    };

    const alignmentSetUpOnNodeDragStart = (node: Node) => {
        const nodesOnCanvas = (reactFlowInstance.getNodes() as InternalNode[])
            .filter(n => n.id !== node.id)
            .map(n => getInternalNodeFromNode(n, reactFlowInstance));

        const xNodes: [string, number][] = nodesOnCanvas.map(n => {
            return [n.id, n.internals.positionAbsolute.x ?? -100];
        });
        const yNodes: [string, number][] = nodesOnCanvas.map(n => {
            return [n.id, n.internals.positionAbsolute?.y ?? -100];
        });

        const comparator = (a: [string, number], b: [string, number]) => a[1] - b[1];
        xNodes.sort(comparator);
        yNodes.sort(comparator);
        setNodesSortedByX(xNodes);
        setNodesSortedByY(yNodes);
    };

    const alignmentCleanUpOnNodeDragStop = (node: Node) => {
        const internalNode = getInternalNodeFromNode(node, reactFlowInstance);
        internalNode.internals.positionAbsolute = {
            x: xAlignmentNode?.internals.positionAbsolute?.x ?? internalNode.internals.positionAbsolute?.x ?? 20,
            y: yAlignmentNode?.internals.positionAbsolute?.y ?? internalNode.internals.positionAbsolute?.y ?? 10
        };
        onReset();
    };

    const alignmentNodesChange = (changes: NodeChange<NodeType>[]) => {
        // To describe the algorithm:
        // We first check if there was already some alignment present and try to set positions based on that
        // Then we check if the position (aligned if there was the alignment) aligns with some node
        // Either it doesn't and it did, so we remove the alignment or it does and wasn't, so we add it.
        // We do the same for x and y coordinates
        // In the end we update the nodes through setNodes if necessary.
        if (changes[0]?.type !== "position") {
            return;
        }

        const nodePositionChange = changes[0] as NodePositionChange;
        if (nodePositionChange.position === undefined) {
            return;
        }
        const nodePositionOriginal = { ...nodePositionChange.position };
        const nodePositionCopy = { ...nodePositionChange.position };

        const isAlignmentNewlyOver = {
            x: false,
            y: false,
        };

        setNodeAbsolutePositionBasedOnPreviousAlignmentNodes(nodePositionCopy, "x");
        setNodeAbsolutePositionBasedOnPreviousAlignmentNodes(nodePositionCopy, "y");

        // TODO: We just info that alignment node changed, so we just need booleans
        const changedAlignmentLines: Coordinate[] = [];
        const indexInSortedArray = {
            x: -1,
            y: -1
        };
        [isAlignmentNewlyOver.x, indexInSortedArray.x] = checkForAlignment(nodePositionCopy, "x", changedAlignmentLines);
        [isAlignmentNewlyOver.y, indexInSortedArray.y] = checkForAlignment(nodePositionCopy, "y", changedAlignmentLines);

        // If we were aligning at least one node and still are
        if (changedAlignmentLines.length === 0 && (indexInSortedArray.x >= 0 || indexInSortedArray.y >= 0)) {
            console.log("If we were aligning at least one node and still are");
            nodePositionChange.position.x = nodePositionCopy.x;
            nodePositionChange.position.y = nodePositionCopy.y;
            return;
        }

        if (changedAlignmentLines.length > 0) {
            if (isAlignmentNewlyOver.x) {
                // alignedInternalNodeCopy.internals.positionAbsolute!.x = internalNode.internals.positionAbsolute.x;
                nodePositionChange!.position!.x = nodePositionOriginal.x;
            }
            else {
                nodePositionChange!.position!.x = nodePositionCopy.x;
            }
            if (isAlignmentNewlyOver.y) {
                // alignedInternalNodeCopy.internals.positionAbsolute!.y = internalNode.internals.positionAbsolute.y;
                nodePositionChange!.position!.y = nodePositionOriginal.y;
            }
            else {
                nodePositionChange!.position!.y = nodePositionCopy.y;
            }
        }
    };

    const getRelevantDataForCoordinate = (coordinate: Coordinate): RelevantAlignmentDataForCoordinate => {
        if (coordinate === "x") {
            const { alignmentXSnapGrid } = configuration();
            return {
                alignmentNode: xAlignmentNode,
                setAlignmentNode: setXAlignmentNode,
                sortedNodes: nodesSortedByX,
                alignmentHelperLine: verticalAlignmentLine,
                setAlignmentHelperLine: setVerticalAlignmentLine,
                alignmentSnapGrid: alignmentXSnapGrid,
            };
        }
        else {
            const { alignmentYSnapGrid } = configuration();
            return {
                alignmentNode: yAlignmentNode,
                setAlignmentNode: setYAlignmentNode,
                sortedNodes: nodesSortedByY,
                alignmentHelperLine: horizontalAlignmentLine,
                setAlignmentHelperLine: setHorizontalAlignmentLine,
                alignmentSnapGrid: alignmentYSnapGrid,
            };
        }
    };

    const setNodeAbsolutePositionBasedOnPreviousAlignmentNodes = (nodePosition: XYPosition, coordinate: Coordinate) => {
        const { alignmentNode, alignmentSnapGrid } = getRelevantDataForCoordinate(coordinate);
        if (alignmentNode !== null) {
            if (isInRange(nodePosition[coordinate], alignmentNode.internals.positionAbsolute[coordinate], alignmentSnapGrid)) {
                // Unlike v11, the positionAbsolute is not undefined
                nodePosition[coordinate] = alignmentNode.internals.positionAbsolute[coordinate];
            }
        }
    };

    const setNewAlignmentLine = (coordinate: Coordinate, coordinatePosition: number): void => {
        const otherCoordinate = getOtherCoordinate(coordinate);
        const { setAlignmentHelperLine } = getRelevantDataForCoordinate(coordinate);
        const { sortedNodes: otherCoordinateSortedNodes } = getRelevantDataForCoordinate(otherCoordinate);

        const point = { x: 0, y: 0 };
        point[otherCoordinate] = otherCoordinateSortedNodes[0]?.[1] as number - 1000;
        point[coordinate] = coordinatePosition;

        // TODO: Could also have the end-point as in the old version
        setAlignmentHelperLine(point);
    };

    const checkForAlignment = (absolutePosition: XYPosition, coordinate: Coordinate, changedAlignmentLines: Coordinate[]): [boolean, number] => {
        const { alignmentNode, setAlignmentNode, sortedNodes, setAlignmentHelperLine } = getRelevantDataForCoordinate(coordinate);
        const indexInSortedArray = binarySearch(sortedNodes, absolutePosition[coordinate]);

        // We are are aligning and weren't or were but to a different position
        if (indexInSortedArray >= 0 && (alignmentNode === null || absolutePosition[coordinate] !== alignmentNode.internals.positionAbsolute[coordinate])) {
            setAlignmentNode(reactFlowInstance.getInternalNode(sortedNodes[indexInSortedArray]?.[0] as string) as (InternalNode | undefined) ?? null);
            const offsetForHandler = 0;
            const coordinatePositionForAlignmentHelperNodes = sortedNodes[indexInSortedArray]?.[1] as number + offsetForHandler;

            setNewAlignmentLine(coordinate, coordinatePositionForAlignmentHelperNodes);
            changedAlignmentLines.push(coordinate);
            return [false, indexInSortedArray];
        }
        else if (indexInSortedArray < 0 && alignmentNode !== null) {    // We were aligning and no longer are
            setAlignmentNode(null);
            setAlignmentHelperLine(null);
            changedAlignmentLines.push(coordinate);
            return [true, indexInSortedArray];
        }

        return [false, indexInSortedArray];
    };

    return {
        onReset,
        alignmentSetUpOnNodeDragStart,
        alignmentCleanUpOnNodeDragStop,
        alignmentNodesChange,
        horizontalAlignmentLine,
        verticalAlignmentLine
    };
};
