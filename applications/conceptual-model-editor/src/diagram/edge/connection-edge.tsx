import type { XYPosition, ConnectionLineComponent } from "@xyflow/react";

import { findRectangleLineIntersection } from "./math";

const BORDER = 6;

/**
 * This edge is used when user drag from a port/handle.
 */
export const ConnectionEdge: ConnectionLineComponent = (props) => {

  const fromNode = props.fromNode;
  if (insideBox(props.toX, props.toY, fromNode.position, fromNode.measured)) {
    return null;
  }

  const source = findRectangleLineIntersection({
    x: props.fromX,
    y: props.fromY
  }, {
    width: (props.fromNode.measured.width ?? 0) + BORDER,
    height: (props.fromNode.measured.height ?? 0) + BORDER,
  }, {
    x: props.toX,
    y: props.toY
  });

  return (
    <g>
      <path
        fill="none"
        stroke="black"
        strokeWidth={1.5}
        className="animated"
        d={`M ${source.x},${source.y} L ${props.toX},${props.toY}`}
      />
      <circle
        cx={props.toX}
        cy={props.toY}
        fill="#fff"
        r={3}
        stroke="black"
        strokeWidth={1.5}
      />
    </g>
  );
};

function insideBox(
  x: number, y: number,
  position: XYPosition, measured: { width?: number; height?: number },
): boolean {
  const relativeX = x - position.x;
  const relativeY = y - position.y;
  return relativeX >= -BORDER
    && relativeY >= -BORDER
    && relativeX <= (measured.width ?? 0) + (2 * BORDER)
    && relativeY <= (measured.height ?? 0) + (2 * BORDER);
}
