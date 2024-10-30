import { useContext } from "react";
import { shallow } from "zustand/shallow";
import { useStore, type ReactFlowState } from "@xyflow/react";

import { DiagramContext } from "../diagram-controller";
import { EdgeToolbarPortal } from "./edge-toolbar-portal";
import { computePosition } from "./edge-utilities";
import { EdgeToolbarProps, viewportStoreSelector } from "./edge-toolbar";

/**
 * As we can not render edge menu on a single place, like node menu, we
 * extracted the menu into a separate component.
 */
export function PropertyEdgeToolbar({ value }: { value: EdgeToolbarProps | null }) {
  const context = useContext(DiagramContext);
  const edge = useStore((state: ReactFlowState) => state.edgeLookup.get(value?.edgeIdentifier ?? ""));
  const { x, y, zoom } = useStore(viewportStoreSelector, shallow);

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
          </ul>
        </div>
      </EdgeToolbarPortal>
    </>
  );
}
