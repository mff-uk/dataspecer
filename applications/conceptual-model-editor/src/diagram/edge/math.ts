import { type Node } from "@xyflow/react";

export type Point = { x: number, y: number };

/**
 * Find intersection of a line starting from center of the rectangle to target point
 * and the rectangle borders.
 */
export function findRectangleLineIntersection(
  source: Point,
  rectangle: { width: number, height: number },
  target: Point,
): Point {
  // We need half of the rectangle sizes.
  const width = rectangle.width / 2;
  const height = rectangle.height / 2;

  // Calculate the rectangle edges.
  const left = source.x - width;
  const right = source.x + width;
  const top = source.y - height;
  const bottom = source.y + height;

  // Calculate direction vector.
  const direction = { x: target.x - source.x, y: target.y - source.y };
  if (Math.abs(direction.x) < width && Math.abs(direction.y) < height) {
    // The point is in the rectangle, we just return the center.
    return source;
  }

  // We may have collision on right, left, top, bottom.
  // We use rectangle sides instead of center thus is the line
  // is horizontal or vertical we get no collision candidates.
  let horizontal: number | null = null;
  if (right > target.x) {
    // Leaving rectangle to the right.
    horizontal = - width / direction.x;
  } else if (left < target.x) {
    // Leaving rectangle to the left.
    horizontal = width / direction.x;
  }
  let vertical: number | null = null;
  if (top > target.y) {
    // Leaving rectangle to the top.
    vertical = - height / direction.y;
  } else if (bottom < target.y) {
    // Leaving rectangle to the bottom.
    vertical = height / direction.y;
  }
  // Now we have horizontal and vertical step toward collision
  // with a side. As the collision can be outside of the rectangle,
  // we need to use the minimum value which is not null.
  if (horizontal === null && vertical === null) {
    // This an happen where we are inside of the source rectangle.
    return { x: source.x, y: source.y };
  }
  if (horizontal !== null && vertical !== null) {
    // We have both values, we choose the smaller value.
    if (Math.abs(horizontal) < Math.abs(vertical)) {
      return add(source, multiply(direction, horizontal));
    } else {
      return add(source, multiply(direction, vertical));
    }
  }
  // Know only one is not null.
  if (horizontal !== null) {
    return add(source, multiply(direction, horizontal));
  } else {
    return add(source, multiply(direction, vertical!));
  }
}

function multiply(point: Point, value: number): Point {
  return { x: point.x * value, y: point.y * value };
}

function add(left: Point, right: Point): Point {
  return { x: left.x + right.x, y: left.y + right.y };
}

export function findLineCenter(source: Point, target: Point): Point {
  const xOffset = Math.abs(target.x - source.x) / 2;
  const x = target.x < source.x ? target.x + xOffset : target.x - xOffset;

  const yOffset = Math.abs(target.y - source.y) / 2;
  const y = target.y < source.y ? target.y + yOffset : target.y - yOffset;

  return { x, y };
}

export function findNodeCenter(node: Node): Point {
  const x = node.position.x + ((node.measured?.width ?? 0) / 2);
  const y = node.position.y + ((node.measured?.height ?? 0) / 2);
  return { x, y };
}

export function findNodeBorder(node: Node, next: Point): Point {
  const center = findNodeCenter(node);
  const size = node.measured;
  if (size === undefined || size.width === undefined || size.height === undefined) {
    return center;
  }
  const rectangle = { width: size.width + 4, height: size.height + 4 };
  return findRectangleLineIntersection(center, rectangle, next);
}

export function findClosestLine(waypoints: Point[], point: Point): number {
  if (waypoints.length < 2) {
    return 0;
  }

  let result = 0;
  let minDistance: number = Infinity;
  // Search for segment closest to the point.
  for (let index = 0; index < waypoints.length - 1; index++) {
    const distance = distanceFromPointToLineSegment(
      point, waypoints[index], waypoints[index + 1]);
    if (distance < minDistance) {
      minDistance = distance;
      result = index;
    }
  }
  return result;
}

function distanceFromPointToLineSegment(
  point: Point, start: Point, end: Point
): number {
  const { x, y } = point;
  const { x: x1, y: y1 } = start;
  const { x: x2, y: y2 } = end;

  // Calculate the squared length of the line segment
  const lineSegmentLengthSquared = (x2 - x1) ** 2 + (y2 - y1) ** 2;

  // If the line segment is actually a point
  if (lineSegmentLengthSquared === 0) {
    return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
  }

  // Calculate the projection parameter.
  const tRaw = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1))
    / lineSegmentLengthSquared;
  const t = Math.max(0, Math.min(1, tRaw));

  // Calculate the closest point on the line segment
  const closestX = x1 + t * (x2 - x1);
  const closestY = y1 + t * (y2 - y1);

  // Return the distance from the point to the closest point on the line segment
  return Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);
}
