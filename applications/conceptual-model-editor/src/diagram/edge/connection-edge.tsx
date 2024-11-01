import { type ConnectionLineComponent } from "@xyflow/react";

import { findRectangleLineIntersection } from "./math";

const SOURCE_BORDER = 6;

/**
 * This edge is used when user drag from a port/handle.
 */
export const ConnectionEdge: ConnectionLineComponent = (props) => {

  const source = findRectangleLineIntersection({
    x: props.fromX,
    y: props.fromY
  }, {
    width: (props.fromNode.measured.width ?? 0) + SOURCE_BORDER,
    height: (props.fromNode.measured.height ?? 0) + SOURCE_BORDER,
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
