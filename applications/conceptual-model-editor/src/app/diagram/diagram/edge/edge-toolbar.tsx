import { useContext } from "react";
import { shallow } from "zustand/shallow";
import {
  useStore,
  type ReactFlowState,
  type Viewport,
} from "@xyflow/react";

import { DiagramContext } from "../diagram-controller";
import { EdgeToolbarPortal } from "./edge-toolbar-portal";

import "./edge-toolbar.css";

export interface EdgeToolbarProps {

  x: number;

  y: number;

  edgeIdentifier: string;

  waypointIndex: number | null;

}

/**
 * We use this to retrieve information about viewport from the store.
 */
const storeSelector = (state: ReactFlowState) => ({
  x: state.transform[0],
  y: state.transform[1],
  zoom: state.transform[2],
});

/**
 * As we can not render edge menu on a single place, like node menu, we
 * extracted the menu into a separate component.
 */
export function EdgeToolbar({ value }: { value: EdgeToolbarProps | null }) {
  const context = useContext(DiagramContext);
  const edge = useStore((state: ReactFlowState) => state.edgeLookup.get(value?.edgeIdentifier ?? ""));
  const { x, y, zoom } = useStore(storeSelector, shallow);

  if (value === null || edge === null || !edge?.selected) {
    return null;
  }

  const identifier = value.edgeIdentifier;
  const position = computePosition(value.x, value.y, {x, y, zoom});

  const onDetail = () => context?.callbacks().onShowEdgeDetail(identifier);
  const onEdit = () => context?.callbacks().onEditEdge(identifier);
  const onProfile = () => context?.callbacks().onCreateEdgeProfile(identifier);
  const onHide = () => context?.callbacks().onHideEdge(identifier);
  const onDelete = () => context?.callbacks().onDeleteEdge(identifier);

  return (
    <>
      <EdgeToolbarPortal>
        <div style={{ transform: `translate(${position.x}px, ${position.y}px)`, position: "absolute", zIndex: 1000 }}>
          <ul className="edge-toolbar">
            <li>
              <button onClick={onDetail}>ℹ</button>
            </li>
            <li>
              <button onClick={onEdit}>✏️</button>
            </li>
            <li>
              <button onClick={onProfile}>🧲</button>
            </li>
            <li>
              <button onClick={onHide}>🕶</button>
            </li>
            <li>
              <button onClick={onDelete}>🗑</button>
            </li>
            {value.waypointIndex !== null ? "Add button to delete waypoint" : ""}
          </ul>
        </div>
      </EdgeToolbarPortal>
    </>
  );
}

// Inspired by getNodeToolbarTransform function in xyflow.
const computePosition = (x: number, y: number, viewport: Viewport): { x: number, y: number } => {
  return {
    x: x * viewport.zoom + viewport.x,
    y: y * viewport.zoom + viewport.y,
  };
};
