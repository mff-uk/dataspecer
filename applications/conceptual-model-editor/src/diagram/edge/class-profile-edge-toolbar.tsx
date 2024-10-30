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
export function ProfileEdgeToolbar({ value }: { value: EdgeToolbarProps | null }) {
  const context = useContext(DiagramContext);
  const edge = useStore((state: ReactFlowState) => state.edgeLookup.get(value?.edgeIdentifier ?? ""));
  const { x, y, zoom } = useStore(viewportStoreSelector, shallow);

  if (value === null || edge === null || !edge?.selected) {
    return null;
  }

  const position = computePosition(value.x, value.y, {x, y, zoom});

  // On detail we open dialog for the class profile node as this
  // type of edge does not have any corresponding entity.
  const onDetail = () => context?.callbacks().onShowNodeDetail(edge.data?.source as string);

  return (
    <>
      <EdgeToolbarPortal>
        <div style={{ transform: `translate(${position.x}px, ${position.y}px)`, position: "absolute", zIndex: 1000 }}>
          <ul>
            <li>
              <button onClick={onDetail}>ℹ</button>
            </li>
          </ul>
        </div>
      </EdgeToolbarPortal>
    </>
  );
}
