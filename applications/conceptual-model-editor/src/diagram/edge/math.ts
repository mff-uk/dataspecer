export type Point = { x: number, y: number };

export type Size = { width: number, height: number };

export type Rectangle = Point & Size;

/**
 * Find intersection of a line starting from center of the rectangle to
 * target point and the rectangle borders.
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

export function findRectangleCenter(rectangle: Rectangle): Point {
  const x = rectangle.x + (rectangle.width / 2);
  const y = rectangle.y + (rectangle.height / 2);
  return { x, y };
}

export function findRectangleBorder(rectangle: Rectangle, point: Point): Point {
  const center = findRectangleCenter(rectangle);
  return findRectangleLineIntersection(center, rectangle, point);
}

/**
 * Given a lines defined by sequence of points.
 * Returns an index of a line sub-sequence closest to the point.
 */
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
  point: Point, start: Point, end: Point,
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

/**
 * Given a rectangle and a point try to find an point on the rectangle
 * border so there is orthogonal line to the given point.
 * As a fallback return closest point to the given point.
 */
export function findOrthogonalRectangleBorder(rectangle: Rectangle, point: Point) {
  if (point.x > rectangle.x &&
    point.x < rectangle.x + rectangle.width) {
    if (point.y < rectangle.y) {
      // The point is above.
      return { x: point.x, y: rectangle.y };
    } else {
      // The point is below.
      return { x: point.x, y: rectangle.y + rectangle.height };
    }
  } else if (point.y > rectangle.y &&
    point.y < rectangle.y + rectangle.height) {
    if (point.x < rectangle.x) {
      // The point is to the left.
      return { x: rectangle.x, y: point.y };
    } else {
      // The point is to the right;
      return { x: rectangle.x + rectangle.width, y: point.y };
    }
  }
  // Fallback
  return findRectangleBorder(rectangle, point);
}

export function findOrthogonalRectangleBorders(
  left: Rectangle, right: Rectangle,
): Point[] {

  // Calculate rectangle corners and edges.
  const leftRight = left.x + left.width;
  const leftBottom = left.y + left.height;
  const rightRight = right.x + right.width;
  const rightBottom = right.y + right.height;

  // Check if rectangles overlap
  const overlaps = !(
    leftRight < right.x || rightRight < left.x
    || leftBottom < right.y || rightBottom < left.y
  );

  // Case 1: Rectangles overlap - find closest points on borders
  if (overlaps) {
    return [findRectangleCenter(left), findRectangleCenter(right)];
  }

  // Check if horizontal connection is possible (y-values overlap)
  const horizontalOverlap = (
    (left.y <= right.y && right.y <= leftBottom) ||
    (left.y <= rightBottom && rightBottom <= leftBottom) ||
    (right.y <= left.y && left.y <= rightBottom));

  // Case 2: Horizontal connection is possible (y-coordinates can be equal)
  if (horizontalOverlap) {
    const y = findPointInOverlap(left.y, leftBottom, right.y, rightBottom);

    let leftX, rightX;
    if (leftRight < right.x) {
      // Left is to the left of right
      leftX = leftRight;
      rightX = right.x;
    } else {
      // Right is to the left of left
      leftX = left.x;
      rightX = rightRight;
    }

    return [{ x: leftX, y }, { x: rightX, y }];
  }

  // Check if vertical connection is possible (x-values overlap)
  const verticalOverlap = (
    (left.x <= right.x && right.x <= leftRight) ||
    (left.x <= rightRight && rightRight <= leftRight) ||
    (right.x <= left.x && left.x <= rightRight));

  // Case 3: Vertical connection is possible (x-coordinates can be equal)
  if (verticalOverlap) {
    const x = findPointInOverlap(left.x, leftRight, right.x, rightRight);

    let leftY, rightY;
    if (leftBottom < right.y) {
      // Left is above right
      leftY = leftBottom;
      rightY = right.y;
    } else {
      // Right is above left
      leftY = left.y;
      rightY = rightBottom;
    }

    return [{ x, y: leftY }, { x, y: rightY }];
  }

  const leftCenter = findRectangleCenter(left);
  const rightCenter = findRectangleCenter(right);
  return [
    findRectangleLineIntersection(leftCenter, left, rightCenter),
    findRectangleLineIntersection(rightCenter, right, leftCenter),
  ];
}

/**
 * The start position must be smaller then the end position.
 */
function findPointInOverlap(
  leftStart: number, leftEnd: number,
  rightStart: number, rightEnd: number,
): number {
  const intersectionStart = Math.max(leftStart, rightStart);
  const intersectionEnd = Math.min(leftEnd, rightEnd);
  const intersectionSpan = intersectionEnd - intersectionStart;
  return intersectionStart + (intersectionSpan / 2);
}
