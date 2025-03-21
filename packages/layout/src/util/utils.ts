import { XY } from "..";
import { EdgeCrossingMetric } from "../graph/graph-metrics/implemented-metrics/edge-crossing";
import { EdgeEndPoint } from "../graph/representation/edge";
import { VisualNodeComplete } from "../graph/representation/node";

// TODO RadStr LAYOUT: After merge fix - I think that this is present in core-v2 utlities in the another open PR
/**
 * Add item, using given identifier, to respective bucket.
 * If your map is represented using {@link Map} type then use the {@link addToMapArray} instead.
 *
 * @example
 * const buckets : Record<string, any> = {}
 * addToRecordArray("bucket", {}, buckets);
 */
export function addToRecordArray<IdentifierType extends string | number, ValueType>(
  identifier: IdentifierType,
  value: ValueType,
  map: Record<IdentifierType, ValueType[]>,
): void {
  let array = map[identifier];
  if (array === undefined) {
    array = [];
    map[identifier] = array;
  }
  array.push(value);
}

export function getTopLeftPosition(
  nodes: EdgeEndPoint[]
) {
  const topLeft = {x: 10000000, y: 10000000};
  nodes.forEach(node => {
    const position = node.completeVisualNode.coreVisualNode.position;
    if(position.x < topLeft.x) {
      topLeft.x = position.x;
    }
    if(position.y < topLeft.y) {
      topLeft.y = position.y;
    }
  });

  return topLeft;
};


export function getBotRightPosition(
  nodes: EdgeEndPoint[]
) {
  const botRight = {x: -10000000, y: -10000000};
  nodes.forEach(node => {
    const visualNode = node.completeVisualNode;
    const x = visualNode.coreVisualNode.position.x + visualNode.width;
    if(x > botRight.x) {
        botRight.x = x;
    }

    const y = visualNode.coreVisualNode.position.y + visualNode.height;
    if(y > botRight.y) {
        botRight.y = y;
    }
  });

  return botRight;
};


// TODO RadStr: Copy-pasted from visual model - maybe since I import this package anyways - it could be defined only here
//               .... It actually isn't exact copy-paste, but almost
function findRectangleLineIntersection(
  source: XY,
  rectangle: { width: number, height: number },
  target: XY,
): XY {
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

function multiply(point: XY, value: number): XY {
  return { x: point.x * value, y: point.y * value };
}

function add(left: XY, right: XY): XY {
  return { x: left.x + right.x, y: left.y + right.y };
}

export function findLineCenter(source: XY, target: XY): XY {
  const xOffset = Math.abs(target.x - source.x) / 2;
  const x = target.x < source.x ? target.x + xOffset : target.x - xOffset;

  const yOffset = Math.abs(target.y - source.y) / 2;
  const y = target.y < source.y ? target.y + yOffset : target.y - yOffset;

  return { x, y };
}

export function findNodeBorder(node: VisualNodeComplete, next: XY): XY {
  const center = EdgeCrossingMetric.getMiddle(node);
  const rectangle = { width: node.width + 4, height: node.height + 4 };
  return findRectangleLineIntersection(center, rectangle, next);
}
// TODO RadStr: End of the "copy-paste"


export enum Direction {
  Up = "UP",
  Right = "RIGHT",
  Down = "DOWN",
  Left = "LEFT"
}

export function reverseDirection(direction: Direction): Direction {
  switch(direction) {
    case Direction.Up:
      return Direction.Down;
    case Direction.Right:
      return Direction.Left;
    case Direction.Down:
      return Direction.Up;
    case Direction.Left:
      return Direction.Right;
  }
}

type PositionWithOptionalAnchor = {
    x: number,
    y: number,
    anchor?: true | null,
}

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
export const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const placeCoordinateOnGrid = (coordinate: number, grid: number): number => {
    const convertedPosition = coordinate - (coordinate % grid);
    return convertedPosition;
}

export const placePositionOnGrid = (position: PositionWithOptionalAnchor, gridX: number, gridY: number): void => {
    position.x = placeCoordinateOnGrid(position.x, gridX);
    position.y = placeCoordinateOnGrid(position.y, gridY);
}

/**
 * This class is used to create unique identifiers of dummy/phantom elements in graph.
 */
export class PhantomElementsFactory {
    static phantomNodeIndex: number = 0;
    static phantomEdgeIndex: number = 0;
    static createUniquePhanomNodeIdentifier(): string {
        const identifier = `phantomNode-${this.phantomNodeIndex}`;
        this.phantomNodeIndex++;

        return identifier;
    }

    /**
     * @deprecated In future will be probably different way to do it
     * @returns
     */
    static createUniqueGeneralizationSubgraphIdentifier(): string {
        const identifier = `subgraph-${this.phantomNodeIndex}`;
        this.phantomNodeIndex++;

        return identifier;
    }

    static createUniquePhanomEdgeIdentifier(): string {
        const identifier = `phantomEdge-${this.phantomEdgeIndex}`;
        this.phantomEdgeIndex++;

        return identifier;
    }

    static constructSplitID = (id: string, index: number): string => {
        return `SPLIT-${index}-${id}`;
    }

    static deconstructSplitID = (id: string): string => {
        return id.split("-").splice(2,).join("");
    }
}

