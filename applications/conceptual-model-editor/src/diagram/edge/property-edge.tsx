import React, { useContext } from "react";
import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  useInternalNode,
  useReactFlow,
} from "@xyflow/react";

import { createLogger } from "../../application/";

import { type Edge as EdgeApi } from "../diagram-model";
import { DiagramContext } from "../diagram-controller";
import { createSvgPath, createWaypoints, findLabelPosition } from "./edge-utilities";
import { Waypoints } from "./waypoints";
import { Point } from "./math";

const logger = createLogger(import.meta.url);

export const PropertyEdge = (props: EdgeProps<Edge<EdgeApi>>) => {
  const sourceNode = useInternalNode(props.source);
  const targetNode = useInternalNode(props.target);
  const reactFlow = useReactFlow();
  const context = useContext(DiagramContext);

  if (sourceNode === undefined || targetNode === undefined) {
    logger.error("Missing source or target.", { props, sourceNode, targetNode });
    return null;
  }

  // Prepare waypoints for the path.
  const waypoints = createWaypoints(sourceNode, props.data?.waypoints ?? [], targetNode);

  // Select label position.
  const labelPosition = findLabelPosition(waypoints);

  // Create path.
  const path = createSvgPath(waypoints);

  // Handler when user clicks the edge, the first click
  // is consumed when not selected
  const onPathClick = (event: React.MouseEvent) => {
    const { x, y } = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    context?.onOpenEdgeContextMenu(props, x, y);
  };

  const sourceWaypoint = waypoints[0];
  const sourceShift = getLabelTranslate(
    sourceWaypoint, sourceNode.position, sourceNode.measured);

  const targetWaypoint = waypoints[waypoints.length - 1];
  const targetShift = getLabelTranslate(
    targetWaypoint, targetNode.position, targetNode.measured);

  return (
    <>
      <g onClick={onPathClick}>
        <BaseEdge id={props.id} path={path} markerEnd={props.markerEnd} style={props.style} />
      </g>
      <>
        {props.selected ? <Waypoints edge={props} waypoints={waypoints} data={props.data} /> : null}
      </>
      <EdgeLabelRenderer>
        {props.data === undefined || props.data.cardinalitySource === null ? null : (
          <div style={{
            position: "absolute",
            transform: `${sourceShift} translate(${sourceWaypoint.x}px,${sourceWaypoint.y}px)`
          }}
          >
            {props.data.cardinalitySource}
          </div>
        )}
        {props.selected || props.label === null ? null : (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelPosition.x}px,${labelPosition.y}px)`,
              // We need this to make the content click-able.
              pointerEvents: "all",
              color: "black",
              backgroundColor: "#F0FDFA",
              // Line break from text, we can split into multiple component and center.
              whiteSpace: "pre-line",
              // Round the edges.
              padding: "5px",
              borderRadius: "15px",
              opacity: props.style?.opacity,
            }}
          >
            {props.label}
          </div>
        )}
        {props.data === undefined || props.data.cardinalityTarget === null ? null : (
          <div style={{
            position: "absolute",
            transform: `${targetShift} translate(${targetWaypoint.x}px,${targetWaypoint.y}px)`
          }}
          >
            {props.data.cardinalityTarget}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export const PropertyEdgeName = "property-edge";

const TRANSLATE_ZERO = "translate(0px,0px)";

/**
 * @returns Shift of the object in percentage.
 */
function getLabelTranslate(
  point: Point,
  nodePosition: Point,
  { width, height }: { width?: number, height?: number },
): string {
  if (width === undefined || height === undefined) {
    return TRANSLATE_ZERO;
  }
  let shiftX = "0%";
  if (point.x < (nodePosition.x)) {
    // Left
    shiftX = "-110%"
  } else if (point.x > (nodePosition.x + width)) {
    // Right
    shiftX = "10%";
  }
  let shiftY = "0%";
  if (point.y < (nodePosition.y)) {
    // Top
    shiftY = "-110%"
  } else if (point.y > (nodePosition.y + height)) {
    // Bottom
    shiftY = "10%";
  }
  return `translate(${shiftX},${shiftY})`;
}
