import { type InternalNode, Viewport } from "@xyflow/react";

import { type Position } from "../diagram-model";
import {
  type Point,
  Rectangle,
  findLineCenter,
  findOrthogonalRectangleBorder,
  findOrthogonalRectangleBorders,
  findRectangleBorder,
} from "./math";

/**
 * Create and return waypoints from line from a source node to a target node.
 *
 * The first and last waypoint lies at intersection of node border and
 * a line from the last waypoint to the node center.
 */
export function createWaypoints(
  source: InternalNode,
  waypoints: Position[],
  target: InternalNode,
): Point[] {

  const nextToSource = waypoints[0] ?? nodeCenter(target);
  const sourcePosition = findNodeBorder(source, nextToSource);

  const prevToTarget = waypoints[waypoints.length - 1] ?? nodeCenter(source);
  const targetPosition = findNodeBorder(target, prevToTarget);

  return [sourcePosition, ...waypoints, targetPosition];
}

function nodeCenter(node: InternalNode): Point {
  const x = node.measured.width === undefined ? node.position.x :
    node.position.x + (node.measured.width / 2);
  const y = node.measured.height === undefined ? node.position.y :
    node.position.x + (node.measured.height / 2);
  return { x, y };
}

function findNodeBorder(node: InternalNode, next: Point): Point {
  if (isMissingMeasured(node)) {
    return nodeCenter(node);
  }
  return findRectangleBorder(asRectangle(node), next);
}

function asRectangle(node: InternalNode): Rectangle {
  // We increase the size here to accommodate for the border.
  return {
    ...node.position,
    width: (node.measured.width ?? 0) + 4,
    height: (node.measured.height ?? 0) + 4,
  };
}

function isMissingMeasured(node: InternalNode) {
  return node.measured === undefined
    || node.measured.width === undefined
    || node.measured.height === undefined;
}

/**
 * Given waypoint find a position for a label.
 *
 * First he function find the two middle waypoints, then returns the center
 * of line between those waypoints.
 */
export function findLabelPosition(waypoints: Point[]): Point {
  if (waypoints.length === 2) {
    return findLineCenter(waypoints[0]!, waypoints[1]!);
  }
  // This is not exact middle, but good enough.
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

/**
 * Given a position in the canvas and a viewport, computes position
 * on the screen.
 *
 * Inspired {@link getNodeToolbarTransform} function in xyflow.
 */
export function computeScreenPosition(
  x: number, y: number, viewport: Viewport,
): Point {
  return {
    x: x * viewport.zoom + viewport.x,
    y: y * viewport.zoom + viewport.y,
  };
};

/**
 * Create and return waypoints from line from a source node to a target node.
 *
 * The first and last waypoint lies at intersection of node border and
 * a line from the last waypoint to the node center.
 */
export function createOrthogonalWaypoints(
  source: InternalNode,
  waypoints: Position[],
  target: InternalNode,
): Position[] {
  if (isMissingMeasured(source) || isMissingMeasured(target)) {
    return [source.position, ...waypoints, target.position];
  }

  if (waypoints.length === 0) {
    // We need to create a connection between two nodes.
    const result = findOrthogonalRectangleBorders(
      asRectangle(source), asRectangle(target));
    return result;
  }

  const nextToSource = waypoints[0];
  const sourcePosition = findOrthogonalRectangleBorder(
    asRectangle(source), nextToSource);

  const prevToTarget = waypoints[waypoints.length - 1];
  const targetPosition = findOrthogonalRectangleBorder(
    asRectangle(target), prevToTarget);

  return [sourcePosition, ...waypoints, targetPosition];
}
