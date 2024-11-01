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
  // Calculate the rectangle edges and direction vector.
  const left = source.x - (rectangle.width / 2);
  const right = source.x + (rectangle.width / 2);
  const top = source.y - (rectangle.height / 2);
  const bottom = source.y + (rectangle.height / 2);
  const direction = { x: target.x - source.x, y: target.y - source.y };
  // We may have collision on right, left, top, bottom.
  // We use rectangle sides instead of center thus is the line
  // is horizontal or vertical we get no collision candidates.
  let horizontal: number | null = null;
  if (right > target.x) {
    // Leaving rectangle to the right.
    horizontal = - (rectangle.width / 2) / direction.x;
  } else if (left < target.x) {
    // Leaving rectangle to the left.
    horizontal = (rectangle.width / 2) / direction.x;
  }
  let vertical: number | null = null;
  if (top > target.y) {
    // Leaving rectangle to the top.
    vertical = - (rectangle.height / 2) / direction.y;
  } else if (bottom < target.y) {
    // Leaving rectangle to the bottom.
    vertical = (rectangle.height / 2) / direction.y;
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
