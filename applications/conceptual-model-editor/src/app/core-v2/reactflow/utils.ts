import { Node, Position, internalsSymbol } from "reactflow";

// returns the position (top,right,bottom or right) passed node compared to
function getParams(nodeA: Node, nodeB: Node) {
    const centerA = getNodeCenter(nodeA);
    const centerB = getNodeCenter(nodeB);

    const horizontalDiff = Math.abs(centerA.x - centerB.x);
    const verticalDiff = Math.abs(centerA.y - centerB.y);

    let position;

    // when the horizontal difference between the nodes is bigger, we use Position.Left or Position.Right for the handle
    if (horizontalDiff > verticalDiff) {
        position = centerA.x > centerB.x ? Position.Left : Position.Right;
    } else {
        // here the vertical difference between the nodes is bigger, so we use Position.Top or Position.Bottom for the handle
        position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
    }

    const { x, y } = getHandleCoordsByPosition(nodeA, position);
    return { x, y, position };
}

const getHandleCoordsByPosition = (node: Node, handlePosition: Position) => {
    // all handles are from type source, that's why we use handleBounds.source here
    const handle = node[internalsSymbol]?.handleBounds?.source?.find((h) => h.position === handlePosition);
    const DEFAULT_COORDS = { x: 69, y: 420 };

    if (!handle || !handle.width || !handle.height) return DEFAULT_COORDS; // FIXME:

    let offsetX = handle.width / 2;
    let offsetY = handle.height / 2;

    // this is a tiny detail to make the markerEnd of an edge visible.
    // The handle position that gets calculated has the origin top-left, so depending which side we are using, we add a little offset
    // when the handlePosition is Position.Right for example, we need to add an offset as big as the handle itself in order to get the correct position
    switch (handlePosition) {
        case Position.Left:
            offsetX = 0;
            break;
        case Position.Right:
            offsetX = handle.width;
            break;
        case Position.Top:
            offsetY = 0;
            break;
        case Position.Bottom:
            offsetY = handle.height;
            break;
    }

    if (!node.positionAbsolute) return DEFAULT_COORDS;

    const x = node.positionAbsolute.x + handle.x + offsetX;
    const y = node.positionAbsolute.y + handle.y + offsetY;

    return { x, y };
};

const getNodeCenter = (node: Node) => {
    if (!node || !node.positionAbsolute || !node.width || !node.height) return { x: 69, y: 420 }; // FIXME:
    return {
        x: node.positionAbsolute.x + node?.width / 2,
        y: node.positionAbsolute.y + node.height / 2,
    };
};

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export const getEdgeParams = (source: Node, target: Node) => {
    const { x: sx, y: sy, position: sourcePos } = getParams(source, target);
    const { x: tx, y: ty, position: targetPos } = getParams(target, source);

    return {
        sx,
        sy,
        tx,
        ty,
        sourcePos,
        targetPos,
    };
};
