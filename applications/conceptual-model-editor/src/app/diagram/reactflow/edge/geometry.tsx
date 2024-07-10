import { type HandleElement, type Node, Position, internalsSymbol } from "reactflow";

export interface Point {
  x: number;
  y: number;
}

export interface HandlePoint extends Point {
  position: Position;
}

/**
 * Given an oriented edge return information about source and target point.
 */
export function getHandleFloatingEdgePoints(source: Node, target: Node): {
  source: HandlePoint,
  target: HandlePoint,
} | null {
  const sourceCenter = getNodeCenter(source);
  const targetCenter = getNodeCenter(target);
  if (sourceCenter === null || targetCenter === null) {
    return null;
  }

  const sourceHandlePosition = sourceCenter.y > targetCenter.y ? Position.Top : Position.Bottom;
  const sourceHandle = getHandleCoordinates(source, sourceHandlePosition) ?? sourceCenter;

  const targetHandlePosition = sourceCenter.x > targetCenter.x ? Position.Right : Position.Left;
  const targetHandle = getHandleCoordinates(target, targetHandlePosition) ?? targetCenter;

  return {
    source: {
      ...sourceHandle,
      position: sourceHandlePosition,
    },
    target: {
      ...targetHandle,
      position: targetHandlePosition,
    }
  };
}

function getNodeCenter(node: Node): Point | null {
  if (node.positionAbsolute === undefined
    || node.width === undefined || node.width == null
    || node.height === undefined || node.height === null) {
    return null;
  }
  return {
    x: node.positionAbsolute.x + node.width / 2,
    y: node.positionAbsolute.y + node.height / 2,
  };
}

/**
 * https://reactflow.dev/examples/edges/simple-floating-edges
 */
function getHandleCoordinates(node: Node, handlePosition: Position): Point | null {
  if (node.positionAbsolute === undefined) {
    return null;
  }
  const handle = getHandle(node, handlePosition);
  if (handle === null) {
    return null;
  }
  let offsetX = handle.width / 2;
  let offsetY = handle.height / 2;
  // This is a tiny detail to make the markerEnd of an edge visible.
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
  return {
    x: node.positionAbsolute.x + handle.x + offsetX,
    y: node.positionAbsolute.y + handle.y + offsetY,
  };
}

/**
 * https://reactflow.dev/examples/edges/simple-floating-edges
 */
function getHandle(node: Node, handlePosition: Position): HandleElement | null {
  return getSourceHandle(node, handlePosition) ?? getTargetHandle(node, handlePosition);
}

function getTargetHandle(node: Node, handlePosition: Position): HandleElement | null {
  const handles = node[internalsSymbol]?.handleBounds?.target ?? [];
  return handles.find(handle => handle.position === handlePosition) ?? null;
}

function getSourceHandle(node: Node, handlePosition: Position): HandleElement | null {
  const handles = node[internalsSymbol]?.handleBounds?.source ?? [];
  return handles.find(handle => handle.position === handlePosition) ?? null;
}

export function getFloatingEdgePoints(source: Node, target: Node): {
  source: HandlePoint,
  target: HandlePoint,
} | null {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);
  if (sourceIntersectionPoint === null || targetIntersectionPoint === null) {
    return null;
  }

  const sourcePosition = getEdgePosition(source, sourceIntersectionPoint);
  const targetPosition = getEdgePosition(target, targetIntersectionPoint);
  if (sourcePosition === null || targetPosition === null) {
    return null;
  }

  return {
    source: {
      ...sourceIntersectionPoint,
      position: sourcePosition,
    },
    target: {
      ...targetIntersectionPoint,
      position: targetPosition,
    }
  };
}

/**
 * Return intersection of a line between node centers with the target node.
 */
function getNodeIntersection(sourceNode: Node, targetNode: Node): Point | null {
  if (sourceNode.positionAbsolute === undefined
    || sourceNode.width === null || sourceNode.width === undefined
    || sourceNode.height === null || sourceNode.height === undefined
    || targetNode.positionAbsolute === undefined) {
    return null;
  }

  const sourceCenter = getNodeCenter(sourceNode);
  const targetCenter = getNodeCenter(targetNode);
  if (sourceCenter === null || targetCenter === null) {
    return null;
  }

  const sourceX = sourceCenter.x;
  const sourceY = sourceCenter.y;

  const targetX = targetCenter.x;
  const targetY = targetCenter.y;

  const w = sourceNode.width / 2;
  const h = sourceNode.height / 2;

  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const xx1 = (targetX - sourceX) / (2 * w) - (targetY - sourceY) / (2 * h);
  const yy1 = (targetX - sourceX) / (2 * w) + (targetY - sourceY) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + sourceX;
  const y = h * (-xx3 + yy3) + sourceY;

  return { x, y };
}

/**
 * Returns the position on node closest to the given point.
 *
 * https://reactflow.dev/examples/edges/floating-edges
 */
function getEdgePosition(node: Node, point: Point) : Position | null{
  const n = { ...node.positionAbsolute, ...node };
  if (n.width === null || n.height === null ) {
    return null;
  }

  const nx = Math.round(n.x ?? 0);
  const ny = Math.round(n.y ?? 0);
  const px = Math.round(point.x);
  const py = Math.round(point.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + (n.width ?? 0) - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= (n.y ?? 0) + (n.height ?? 0) - 1) {
    return Position.Bottom;
  }
  return Position.Top;
}