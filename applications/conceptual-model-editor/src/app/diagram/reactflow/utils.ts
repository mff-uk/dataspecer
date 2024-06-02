import { type Node, Position, internalsSymbol } from "reactflow";

// returns the position (top,right,bottom or right) passed node compared to
function getParams(nodeA: Node, nodeB: Node, isTarget: boolean) {
    const centerA = getNodeCenter(nodeA);
    const centerB = getNodeCenter(nodeB);

    let position;

    // when the horizontal difference between the nodes is bigger, we use Position.Left or Position.Right for the handle
    // if (horizontalDiff > verticalDiff) {
    // source is top/bottom, target is left right
    if (isTarget) {
        position = centerA.x > centerB.x ? Position.Left : Position.Right;
    } else {
        // here the vertical difference between the nodes is bigger, so we use Position.Top or Position.Bottom for the handle
        position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
    }

    const { x, y } = getHandleCoordsByPosition(nodeA, position, isTarget);
    return { x, y, position };
}

const getHandleCoordsByPosition = (node: Node, handlePosition: Position, isTarget: boolean) => {
    // all handles are from type source, that's why we use handleBounds.source here
    const handle = isTarget
        ? node[internalsSymbol]?.handleBounds?.target?.find((h) => h.position === handlePosition)
        : node[internalsSymbol]?.handleBounds?.source?.find((h) => h.position === handlePosition);

    const DEFAULT_COORDS = { x: 69, y: 420 };

    if (!handle || !handle.width || !handle.height) return DEFAULT_COORDS;

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
    if (!node || !node.positionAbsolute || !node.width || !node.height) return { x: 69, y: 420 };
    return {
        x: node.positionAbsolute.x + node?.width / 2,
        y: node.positionAbsolute.y + node.height / 2,
    };
};

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export const getEdgeParams = (source: Node, target: Node) => {
    const { x: sx, y: sy, position: sourcePos } = getParams(source, target, false);
    const { x: tx, y: ty, position: targetPos } = getParams(target, source, true);

    return {
        sx,
        sy,
        tx,
        ty,
        sourcePos,
        targetPos,
    };
};

const leftRight = ["left", "right"];
const topBottom = ["bottom", "top"];

export function getCorner(s: Node, t: Node, offset = 30) {
    let x, y;
    if (topBottom.includes(s.sourcePosition ?? "florb"))
        y = s.position.y <= t.position.y ? s.position.y - offset : s.position.y + offset;
    else y = s.position.y <= t.position.y ? t.position.y + offset : t.position.y - offset;

    if (leftRight.includes(s.sourcePosition ?? "florb"))
        x = s.position.x <= t.position.x ? s.position.x - offset : s.position.x + offset;
    else x = s.position.x <= t.position.x ? t.position.x + offset : t.position.x - offset;

    return [x, y] as const;
}

export function getLoopPath(s: Node, t: Node, typeE: "rel" | "gen", offset = 30) {
    const handleT = s[internalsSymbol]?.handleBounds?.target?.find((h) => h.id === (typeE == "rel" ? "tb" : "tb"));
    const handleS = s[internalsSymbol]?.handleBounds?.source?.find((h) => h.id === (typeE == "rel" ? "sc" : "sa"));

    const handleTx = handleT?.x ?? 69;
    const handleTy = handleT?.y ?? 69;
    const handleSx = handleS?.x ?? 69;
    const handleSy = handleS?.y ?? 69;

    const p2 =
        typeE == "rel"
            ? {
                  x: s.position.x + (s.width ?? 100),
                  y: s.position.y + (s.height ?? 100) + offset,
              }
            : {
                  x: s.position.x + (s.width ?? 100) + offset,
                  y: s.position.y + -offset,
              };

    const path = `M ${s.position.x + handleSx},${s.position.y + handleSy} A 1 1 90 0 ${typeE == "rel" ? 0 : 1} ${
        t.position.x + handleTx
    } ${t.position.y + handleTy}`;
    return [path, p2.x, p2.y] as const;
}

export const onDragStart = (event: DragEvent, entityId: string, nodeType: string) => {
    if (!event.dataTransfer) {
        return;
    }
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("application/reactflow-entityId", entityId);

    event.dataTransfer.effectAllowed = "move";
};
