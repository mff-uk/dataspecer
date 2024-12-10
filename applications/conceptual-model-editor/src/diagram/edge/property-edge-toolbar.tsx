import { useContext } from "react";
import { shallow } from "zustand/shallow";
import { useStore, type ReactFlowState } from "@xyflow/react";

import { DiagramContext } from "../diagram-controller";
import { computePosition } from "./edge-utilities";
import { EdgeToolbarProps, viewportStoreSelector } from "./edge-toolbar";
import { Edge } from "../diagram-api";
import { ToolbarPortal } from "../canvas/toolbar-portal";

/**
 * As we can not render edge menu on a single place, like node menu, we
 * extracted the menu into a separate component.
 */
export function PropertyEdgeToolbar({ value }: { value: EdgeToolbarProps | null }) {
  const context = useContext(DiagramContext);
  const edge = useStore((state: ReactFlowState) => state.edgeLookup.get(value?.edgeIdentifier ?? ""));
  const { x, y, zoom } = useStore(viewportStoreSelector, shallow);

  if (value === null || edge?.data === undefined || !edge?.selected) {
    return null;
  }

  const data = edge.data as Edge;
  const onDetail = () => context?.callbacks().onShowEdgeDetail(data);
  const onEdit = () => context?.callbacks().onEditEdge(data);
  const onProfile = () => context?.callbacks().onCreateEdgeProfile(data);
  const onHide = () => context?.callbacks().onHideEdge(data);
  const onDelete = () => context?.callbacks().onDeleteEdge(data);

  const position = computePosition(value.x, value.y, { x, y, zoom });

  return (
    <>
      <ToolbarPortal>
        <div className="edge-toolbar" style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
          <div className="property-edge">
            <button onClick={onDetail}>ℹ</button>
            <ul className="edge-toolbar">
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
        </div>
      </ToolbarPortal>
    </>
  );
}
