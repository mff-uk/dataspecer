import { useContext } from "react";
import { shallow } from "zustand/shallow";
import { type ReactFlowState, useStore } from "@xyflow/react";

import { DiagramContext } from "../diagram-controller";
import { computePosition } from "./edge-utilities";
import { EdgeToolbarProps, viewportStoreSelector } from "./edge-toolbar";
import { Edge } from "../diagram-api";
import { ToolbarPortal } from "../canvas/toolbar-portal";

/**
 * As we can not render edge menu on a single place, like node menu, we
 * extracted the menu into a separate component.
 */
export function ProfileEdgeToolbar({ value }: { value: EdgeToolbarProps | null }) {
  const context = useContext(DiagramContext);
  const edge = useStore((state: ReactFlowState) => state.edgeLookup.get(value?.edgeIdentifier ?? ""));
  const { x, y, zoom } = useStore(viewportStoreSelector, shallow);

  if (value === null || edge === undefined || edge.data === undefined || !edge?.selected || context === null || context.shouldShowSelectionToolbar()) {
    return null;
  }

  const data = edge.data as Edge;
  const onDetail = () => context?.callbacks().onShowEdgeDetail(data);

  const position = computePosition(value.x, value.y, {x, y, zoom});

  return (
    <>
      <ToolbarPortal>
        <div className="edge-toolbar" style={{ transform: `translate(${position.x}px, ${position.y}px)`}}>
          <button onClick={onDetail}>ℹ</button>
        </div>
      </ToolbarPortal>
    </>
  );
}
