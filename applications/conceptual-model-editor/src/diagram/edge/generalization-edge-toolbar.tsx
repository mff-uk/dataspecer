import { useContext } from "react";
import { shallow } from "zustand/shallow";
import { type ReactFlowState, useInternalNode, useStore } from "@xyflow/react";

import { DiagramContext, NodeMenuType } from "../diagram-controller";
import { computeScreenPosition, onAddWaypoint } from "./edge-utilities";
import { EdgeToolbarProps, viewportStoreSelector } from "./edge-toolbar";
import { Edge } from "../diagram-model";
import { ToolbarPortal } from "../canvas/toolbar-portal";

/**
 * As we can not render edge menu on a single place, like node menu, we
 * extracted the menu into a separate component.
 */
export function GeneralizationEdgeToolbar({ value }: { value: EdgeToolbarProps | null }) {
  const context = useContext(DiagramContext);
  const edge = useStore((state: ReactFlowState) => state.edgeLookup.get(value?.edgeIdentifier ?? ""));
  const { x, y, zoom } = useStore(viewportStoreSelector, shallow);

  // We must call the hooks before making any "if" statement.
  const data = edge?.data as Edge;
  const sourceNode = useInternalNode(data?.source ?? "");
  const targetNode = useInternalNode(data?.target ?? "");

  if (value === null || data === undefined || !edge?.selected ||
    context === null || sourceNode === undefined || targetNode === undefined ||
    context.getShownNodeMenuType() !== NodeMenuType.SingleNodeMenu) {
    return null;
  }

  const position = computeScreenPosition(value.x, value.y, { x, y, zoom });

  const onDetail = () => context?.callbacks().onShowEdgeDetail(data);
  const onHide = () => context?.callbacks().onHideEdge(data);
  const onDelete = () => context?.callbacks().onDeleteEdge(data);
  const addWaypoint = () => onAddWaypoint(
    context, sourceNode, targetNode, data, value);

  return (
    <>
      <ToolbarPortal>
        <div className="edge-toolbar" style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
          <div className="property-edge">
            <button onClick={onDetail}>ℹ</button>
            <ul className="edge-toolbar">
              <li></li>
              <li></li>
              <li>
                <button onClick={onHide}>🕶</button>
              </li>
              <li>
                <button onClick={onDelete}>🗑</button>
              </li>
              <li>
                <button onClick={addWaypoint}>X</button>
              </li>
            </ul>
          </div>
        </div>
      </ToolbarPortal>
    </>
  );
}
