import { ReactFlowState } from "@xyflow/react";

import { Position } from "../diagram-api";

import "./canvas-toolbar.css";
import "../node/node-secondary-toolbar.css";
import "./canvas-toolbar-drag-edge.css";

export type CanvasToolbarTypes = "EDGE-DRAG-CANVAS-MENU-TOOLBAR" | "NODE-SELECTION-ACTIONS-SECONDARY-TOOLBAR";

/**
 * The canvas toolbar is always caused by action on some node.
 * Either by opening next level of toolbar or by dragging edge to canvas.
 * We do not copy the node information here.
 * Instead a toolbar is expected to retrieve it from the xyflow.
 * Thus we have one less place to update when there is a change.
 */
export interface CanvasToolbarGeneralProps {

  abosluteFlowPosition: Position;

  sourceNodeIdentifier: string;

  toolbarType: CanvasToolbarTypes;
}

/**
 * We use this to retrieve information about viewport from the store.
 */
export const viewportStoreSelector = (state: ReactFlowState) => ({
  x: state.transform[0],
  y: state.transform[1],
  zoom: state.transform[2],
});
