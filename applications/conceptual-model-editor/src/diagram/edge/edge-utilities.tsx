import React, { useCallback, useContext } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  useInternalNode,
  type EdgeProps,
  type Edge,
  useReactFlow,
  type InternalNode,
  Viewport,
} from "@xyflow/react";

import { arrayReplace, arrayInsert } from "../../util/functions";
import { findNodeCenter, type Point, findLineCenter, findRectangleLineIntersection, findNodeBorder } from "./math";
import { createLogger } from "../../application";

import { type Edge as EdgeApi, EdgeType, type Position } from "../diagram-api";
import { DiagramContext } from "../diagram-controller";
import type { Waypoint as WaypointType } from "@dataspecer/core-v2/visual-model";

export function createWaypoints(sourceNode: InternalNode, waypoints: Position[], targetNode: InternalNode): Point[] {

  const nextToSource = waypoints[0] ?? findNodeCenter(targetNode);
  const sourcePosition = findNodeBorder(sourceNode, nextToSource);

  // We need to center target to the border, so the
  // edge end marker is visible.
  const prevToTarget = waypoints[waypoints.length - 1] ?? findNodeCenter(sourceNode);
  const targetPosition = findNodeBorder(targetNode, prevToTarget);

  return [sourcePosition, ...waypoints, targetPosition];
}

/**
 * Use segment between two central waypoints.
 *
 * @returns Position for the label.
 */
export function findLabelPosition(waypoints: Point[]): Point {
  if (waypoints.length === 2) {
    // Only start and the end.
    return findLineCenter(waypoints[0]!, waypoints[1]!);
  }
  // Since length >= 3, we get at least one ..
  const index = Math.floor(waypoints.length / 2);
  return findLineCenter(waypoints[index]!, waypoints[index + 1]!);
}

export function createSvgPath(waypoints: Point[]): string {
  let path = `M ${waypoints[0]!.x},${waypoints[0]!.y}`;
  for (let index = 1; index < waypoints.length; ++index) {
    path += ` L ${waypoints[index]!.x},${waypoints[index]!.y}`;
  }
  return path;
}

export function Waypoints(props: {
  edgeId: string,
  waypoints: Point[],
  data?: EdgeApi,
}) {

  // TODO Waypoints are disabled for now.
  return null;

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

// Inspired by getNodeToolbarTransform function in xyflow.
export const computePosition = (x: number, y: number, viewport: Viewport): { x: number, y: number } => {
  return {
    x: x * viewport.zoom + viewport.x,
    y: y * viewport.zoom + viewport.y,
  };
};
