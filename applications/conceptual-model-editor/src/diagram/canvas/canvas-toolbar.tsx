import { useContext } from "react";
import { shallow } from "zustand/shallow";
import { useStore } from "@xyflow/react";

import { DiagramContext } from "../diagram-controller";
import { ToolbarPortal } from "./toolbar-portal";
import { CanvasToolbarGeneralProps, viewportStoreSelector } from "./canvas-toolbar-props";
import { computePosition } from "../edge/edge-utilities";
import { CanvasToolbarCreatedByEdgeDrag } from "./canvas-toolbar-drag-edge";
import { NodeSelectionActionsSecondaryToolbar } from "../node/node-secondary-toolbar";


/**
 * As we can not render menu on a single place, like node menu, we
 * extracted the menu into a separate component.
 */
export function CanvasToolbarGeneral({ value }: { value: CanvasToolbarGeneralProps | null }) {
  const { x, y, zoom } = useStore(viewportStoreSelector, shallow);
  if (value === null) {
    return null;
  }

  const position = computePosition(value.abosluteFlowPosition.x, value.abosluteFlowPosition.y, { x, y, zoom });

  let canvasToolbarContent;
  if(value.toolbarType === "EDGE-DRAG-CANVAS-MENU-TOOLBAR") {
    canvasToolbarContent = <CanvasToolbarCreatedByEdgeDrag value={value}/>;
  }
  else if(value.toolbarType === "NODE-SELECTION-ACTIONS-SECONDARY-TOOLBAR") {
    canvasToolbarContent = <NodeSelectionActionsSecondaryToolbar value={value}/>;
  }

  return <div>
      <ToolbarPortal>
        <div className="canvas-toolbar" style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
          {canvasToolbarContent}
        </div>
      </ToolbarPortal>
    </div>;
}
