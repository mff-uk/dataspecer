import { ReactFlowState } from "@xyflow/react";

import { EdgeType } from "../diagram-api";

import "./edge-toolbar.css";

/**
 * We do not copy the whole edge information here.
 * Instead a toolbar is expected to retrieve it from the xyflow.
 * Thus we have one less place to update when there is a change.
 */
export interface EdgeToolbarProps {

  x: number;

  y: number;

  edgeIdentifier: string;

  edgeType: EdgeType;

  waypointIndex: number | null;

}

/**
 * We use this to retrieve information about viewport from the store.
 */
export const viewportStoreSelector = (state: ReactFlowState) => ({
  x: state.transform[0],
  y: state.transform[1],
  zoom: state.transform[2],
});
