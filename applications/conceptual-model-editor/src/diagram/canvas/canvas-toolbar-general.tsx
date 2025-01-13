import { shallow } from "zustand/shallow";
import { useStore } from "@xyflow/react";

import { ToolbarPortal } from "./toolbar-portal";
import { CanvasToolbarContentProps, CanvasToolbarContentType, viewportStoreSelector } from "./canvas-toolbar-props";
import { computePosition } from "../edge/edge-utilities";

export type CanvasToolbarGeneralComponentProps = {
  toolbarProps: CanvasToolbarContentProps;
  toolbarContent: CanvasToolbarContentType;
};

/**
 * This is general component. The purpose is to show given {@link canvasContent} component on position
 * stored inside {@link value}
 */
export function CanvasToolbarGeneral({canvasToolbar}: {canvasToolbar: CanvasToolbarGeneralComponentProps | null}) {
  const { x, y, zoom } = useStore(viewportStoreSelector, shallow);

  if(canvasToolbar === null) {
    return null;
  }

  const position = computePosition(canvasToolbar.toolbarProps.canvasPosition.x, canvasToolbar.toolbarProps.canvasPosition.y, { x, y, zoom });

  return <div>
    <ToolbarPortal>
      <div className="canvas-toolbar" style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
        {canvasToolbar.toolbarContent({toolbarProps: canvasToolbar.toolbarProps})}
      </div>
    </ToolbarPortal>
  </div>;
}
