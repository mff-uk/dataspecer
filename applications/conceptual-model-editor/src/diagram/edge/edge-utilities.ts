import { type InternalNode, Viewport } from "@xyflow/react";

import { type Point, findLineCenter, findNodeBorder, findNodeCenter } from "./math";
import { type Position } from "../diagram-api";

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

// Inspired by getNodeToolbarTransform function in xyflow.
export const computePosition = (x: number, y: number, viewport: Viewport): { x: number, y: number } => {
  return {
    x: x * viewport.zoom + viewport.x,
    y: y * viewport.zoom + viewport.y,
  };
};
