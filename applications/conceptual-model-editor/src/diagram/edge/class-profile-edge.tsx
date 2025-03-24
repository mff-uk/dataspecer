import React, { useContext } from "react";
import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  useInternalNode,
  useReactFlow,
} from "@xyflow/react";

import { createLogger } from "../../application";

import { type Edge as EdgeApi } from "../diagram-model";
import { DiagramContext } from "../diagram-controller";
import { createSvgPath, createWaypoints, findLabelPosition } from "./edge-utilities";
import { Waypoints } from "./waypoints";

const logger = createLogger(import.meta.url);

export const ClassProfileEdge = (props: EdgeProps<Edge<EdgeApi>>) => {
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

  const style = {
    ...props.style,
    strokeDasharray: 5,
  };

  return (
    <>
      <g onClick={onPathClick}>
        <BaseEdge id={props.id} path={path} markerEnd={props.markerEnd} style={style} />
      </g>
      <>
        {props.selected ? <Waypoints edge={props} waypoints={waypoints} data={props.data} /> : null}
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

export const ClassProfileEdgeName = "class-profile-edge";
