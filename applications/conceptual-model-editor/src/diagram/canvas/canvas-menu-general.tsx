import { shallow } from "zustand/shallow";
import { useStore } from "@xyflow/react";

import { ToolbarPortal } from "./toolbar-portal";
import { CanvasMenuContentProps, CanvasMenuContentType, viewportStoreSelector } from "./canvas-menu-props";
import { computeScreenPosition } from "../edge/edge-utilities";

export type GeneralCanvasMenuComponentProps = {
  menuProps: CanvasMenuContentProps;
  menuContent: CanvasMenuContentType;
};

/**
 * This is general component. The purpose is to show given {@link canvasContent} component on position
 * stored inside {@link value}
 */
export function CanvasGeneralMenu({canvasMenu}: {canvasMenu: GeneralCanvasMenuComponentProps | null}) {
  const { x, y, zoom } = useStore(viewportStoreSelector, shallow);

  if(canvasMenu === null) {
    return null;
  }

  const position = computeScreenPosition(canvasMenu.menuProps.canvasPosition.x, canvasMenu.menuProps.canvasPosition.y, { x, y, zoom });

  return <div>
    <ToolbarPortal>
      <div className="canvas-menu" style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
        {canvasMenu.menuContent({menuProps: canvasMenu.menuProps})}
      </div>
    </ToolbarPortal>
  </div>;
}
