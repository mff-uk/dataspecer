import React, { useContext } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  useInternalNode,
  type EdgeProps,
  type Edge,
  useReactFlow,
} from "@xyflow/react";

import { createLogger } from "../../application/";

import { type Edge as EdgeApi } from "../diagram-api";
import { DiagramContext } from "../diagram-controller";
import { createSvgPath, createWaypoints, findLabelPosition, Waypoints } from "./edge-utilities";

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
  const waypoints = createWaypoints(sourceNode, props.data?.waypoints.map(item => item.position) ?? [], targetNode);

  // Select label position.
  const labelPosition = findLabelPosition(waypoints);

  // Create path.
  const path = createSvgPath(waypoints);

  // Handler when user clicks the edge, the first click
  // is consumed when not selected
  const onPathClick = (event: React.MouseEvent) => {
    const { x, y } = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    context?.onOpenEdgeContextMenu(props.id, null, x, y);
  };

  return (
    <>
      <g onClick={onPathClick}>
        <BaseEdge id={props.id} path={path} markerEnd={props.markerEnd} style={props.style} />
      </g>
      <>
        {props.selected ? <Waypoints edgeId={props.id} waypoints={waypoints} data={props.data} /> : null}
      </>
      <EdgeLabelRenderer>
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
            }}
          >
            {props.label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export const PropertyEdgeName = "property-edge";

