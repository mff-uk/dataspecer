import React, { useCallback, useContext } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  useInternalNode,
  type EdgeProps,
  type Edge,
  useReactFlow,
  type InternalNode,
  MarkerType,
} from "@xyflow/react";

import { arrayReplace, arrayInsert } from "../../util/functions";
import { findNodeCenter, type Point, findLineCenter } from "./math";
import { createLogger } from "../../application/";

import { type Edge as EdgeApi, EdgeType, type Position } from "../diagram-api";
import { DiagramContext } from "../diagram-controller";
import type { Waypoint as WaypointType } from "@dataspecer/core-v2/visual-model";

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

  const markerEnd = selectType(props.data!);

  return (
    <>
      <g onClick={onPathClick}>
        <BaseEdge id={props.id} path={path} markerEnd={markerEnd.type} style={{ color: "black" }} />
      </g>
      <>
        {props.selected ? <Waypoints edgeId={props.id} waypoints={waypoints} data={props.data} /> : null}
      </>
      <EdgeLabelRenderer>
        {props.selected ? null : (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelPosition.x}px,${labelPosition.y}px)`,
              // We need this to make the content click-able.
              pointerEvents: "all",
              color: "black",
              backgroundColor: "white",
              // Line break from text, we can split into multiple component and center.
              whiteSpace: "pre-line",
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

function createWaypoints(sourceNode: InternalNode, waypoints: Position[], targetNode: InternalNode): Point[] {
  // We start with special cases.
  const sourceCenter = findNodeCenter(sourceNode);
  const targetCenter = findNodeCenter(targetNode);
  return [sourceCenter, ...waypoints, targetCenter];
}

/**
 * Use segment between two central waypoints.
 *
 * @returns Position for the label.
 */
function findLabelPosition(waypoints: Point[]): Point {
  if (waypoints.length === 2) {
    // Only start and the end.
    return findLineCenter(waypoints[0]!, waypoints[1]!);
  }
  // Since length >= 3, we get at least one ..
  const index = Math.floor(waypoints.length / 2);
  return findLineCenter(waypoints[index]!, waypoints[index + 1]!);
}

function createSvgPath(waypoints: Point[]): string {
  let path = `M ${waypoints[0]!.x},${waypoints[0]!.y}`;
  for (let index = 1; index < waypoints.length; ++index) {
    path += ` L ${waypoints[index]!.x},${waypoints[index]!.y}`;
  }
  return path;
}

function selectType(edge: EdgeApi) {
  switch (edge.type) {
    case EdgeType.Association:
      return { type: MarkerType.Arrow, height: 20, width: 20, color: edge.color };
    case EdgeType.AssociationProfile:
      return { type: MarkerType.Arrow, height: 20, width: 20, color: edge.color };
    case EdgeType.Generalization:
      return { type: MarkerType.ArrowClosed, height: 20, width: 20, color: edge.color };
    case EdgeType.ClassUsage:
      return { type: MarkerType.ArrowClosed, height: 20, width: 20, color: edge.color };
  }
}

function Waypoints(props: {
  edgeId: string,
  waypoints: Point[],
  data?: EdgeApi,
}) {
  // We need to provide user with ability to create waypoints candidates,
  // we place then in between of each two waypoints.
  const waypointCandidates: Point[] = [];
  for (let index = 0; index < props.waypoints.length - 1; ++index) {
    const first = props.waypoints[index]!;
    const second = props.waypoints[index + 1]!;
    waypointCandidates.push(findLineCenter(first, second));
  }

  return (
    <>
      {props.waypoints.slice(1, props.waypoints.length - 1).map((waypoint, index) => (
        <Waypoint key={`waypoint-${index}-${waypoint.x}-${waypoint.y}}`}
          edgeId={props.edgeId}
          index={index}
          x={waypoint.x}
          y={waypoint.y}
        />
      ))}
      {waypointCandidates.map((waypoint, index) => (
        <WaypointCandidate key={`waypoint-candidate-${index}-${waypoint.x}-${waypoint.y}`}
          edgeId={props.edgeId}
          index={index}
          x={waypoint.x}
          y={waypoint.y} />
      ))}
    </>
  );
}

function Waypoint(props: {
  edgeId: string,
  index: number,
  x: number,
  y: number,
}) {
  const reactFlow = useReactFlow();
  const context = useContext(DiagramContext);

  /**
   * In reaction to mouse down we register new events and handle moving around the editor.
   */
  const onStartDrag = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    const diagram = document.getElementById("reactflow-diagram")!;
    let positionHasChanged = false;

    const handleMove = (event: MouseEvent) => {
      const position = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      positionHasChanged = true;

      reactFlow.updateEdgeData(props.edgeId, (previous) => {
        const waypoints = arrayReplace(
          (previous?.data?.waypoints as any as WaypointType[]) ?? [],
          props.index,
          { x: position.x, y: position.y, anchored: null }
        );
        return { ...previous.data, waypoints };
      });
    };

    const removeListeners = () => {
      diagram.removeEventListener("mousemove", handleMove);
      diagram.removeEventListener("mouseleave", removeListeners);
      diagram.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseUp = () => {
      removeListeners();
      // In addition if there was no movement it may be just a click.
      if (!positionHasChanged) {
        context?.onOpenEdgeContextMenu(props.edgeId, props.index, props.x, props.y);
      }
    };

    diagram.addEventListener("mousemove", handleMove);
    diagram.addEventListener("mouseleave", removeListeners);
    diagram.addEventListener("mouseup", handleMouseUp);

  }, [props.edgeId, props.index]);

  return (
    <>
      <circle
        cx={props.x}
        cy={props.y}
        fill="#fff"
        r={12}
        stroke="black"
        strokeWidth={1.5}
        style={{ pointerEvents: "visibleFill" }}
        onMouseDown={onStartDrag}
      />
    </>
  );

}

function WaypointCandidate(props: {
  edgeId: string,
  /**
   * Index to place new waypoint to.
   */
  index: number,
  x: number,
  y: number,
}) {
  const reactFlow = useReactFlow();

  /**
   * In reaction to mouse down we add a new waypoint to our parent.
   */
  const onMouseDownHandler = (event: React.MouseEvent) => {
    event.preventDefault();

    reactFlow.updateEdgeData(props.edgeId, (previous) => {
      const waypoints = arrayInsert(
        (previous?.data?.waypoints as any as WaypointType[]) ?? [],
        props.index,
        { x: props.x, y: props.y, anchored: null });
      return { ...previous.data, waypoints };
    });
  };

  return (
    <g onMouseDown={onMouseDownHandler}>
      <circle
        cx={props.x}
        cy={props.y}
        fill="#fff"
        r={8}
        stroke="black"
        strokeWidth={1.5}
        style={{ pointerEvents: "visibleFill" }}
      />
      <path
        fill="none"
        stroke="green"
        strokeWidth={2}
        d={`M ${props.x - 4},${props.y} L ${props.x + 4},${props.y} M ${props.x},${props.y - 4} L ${props.x},${props.y + 4}`}
      />
    </g>
  );
}

