import { useContext } from "react";
import { shallow } from "zustand/shallow";
import { useStore, type ReactFlowState } from "@xyflow/react";

import { DiagramContext } from "../diagram-controller";
import { EdgeToolbarPortal } from "./edge-toolbar-portal";
import { computePosition } from "./edge-utilities";
import { EdgeToolbarProps, viewportStoreSelector } from "./edge-toolbar";
import { Edge } from "../diagram-api";

/**
 * As we can not render edge menu on a single place, like node menu, we
 * extracted the menu into a separate component.
 */
export function GeneralizationEdgeToolbar({ value }: { value: EdgeToolbarProps | null }) {
  const context = useContext(DiagramContext);
  const edge = useStore((state: ReactFlowState) => state.edgeLookup.get(value?.edgeIdentifier ?? ""));
  const { x, y, zoom } = useStore(viewportStoreSelector, shallow);

  if (value === null || edge?.data === undefined || !edge?.selected) {
    return null;
  }

  const data = edge.data as Edge;
  const onDetail = () => context?.callbacks().onShowEdgeDetail(data);
  const onDelete = () => context?.callbacks().onDeleteEdge(data);

  const position = computePosition(value.x, value.y, { x, y, zoom });

  return (
    <>
      <EdgeToolbarPortal>
        <div style={{ transform: `translate(${position.x}px, ${position.y}px)`, position: "absolute", zIndex: 1000 }}>
          <ul className="edge-toolbar">
            <li>
              <button onClick={onDetail}>ℹ</button>
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
