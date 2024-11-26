// Heavily inspired by edge-toolbar.ts

import { ReactFlowState } from "@xyflow/react";

import { Node as ApiNode, Position } from "../diagram-api";

import "./canvas-toolbar.css";
import "../node/node-secondary-toolbar.css";
import "./canvas-toolbar-drag-edge.css";

export type CanvasToolbarTypes = "EDGE-DRAG-CANVAS-MENU-TOOLBAR" | "NODE-SECONDARY-TOOLBAR";

/**
 * We do not copy the whole edge information here.
 * Instead a toolbar is expected to retrieve it from the xyflow.
 * Thus we have one less place to update when there is a change.
 */
export interface CanvasToolbarGeneralProps {

  relativePositionToViewportX: number;

  relativePositionToViewportY: number;

  abosluteFlowPosition: Position;

  sourceClassNode: ApiNode;

  // TODO: Not sure how should I propagate this, maybe it should be on better place - maybe context (DiagramContextType)?
  closeCanvasToolbar: () => void;

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
