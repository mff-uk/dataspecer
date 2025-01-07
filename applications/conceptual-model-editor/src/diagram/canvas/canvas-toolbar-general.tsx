import { Children, useContext } from "react";
import { shallow } from "zustand/shallow";
import { useStore } from "@xyflow/react";

import { DiagramContext } from "../diagram-controller";
import { ToolbarPortal } from "./toolbar-portal";
import { CanvasToolbarContentType, CanvasToolbarGeneralProps, viewportStoreSelector } from "./canvas-toolbar-props";
import { computePosition } from "../edge/edge-utilities";

type CanvasToolbarGeneralComponentProps = {
  toolbarProps: CanvasToolbarGeneralProps | null;
  toolbarContent: CanvasToolbarContentType;
};

/**
 * This is general component. The purpose is to show given {@link canvasContent} component on position
 * stored inside {@link value}
 */
export function CanvasToolbarGeneral({ toolbarProps, toolbarContent }: CanvasToolbarGeneralComponentProps) {
  if (toolbarProps === null) {
    return null;
  }
  const { x, y, zoom } = useStore(viewportStoreSelector, shallow);
  const position = computePosition(toolbarProps.canvasPosition.x, toolbarProps.canvasPosition.y, { x, y, zoom });

  return <div>
      <ToolbarPortal>
        <div className="canvas-toolbar" style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
          {toolbarContent({toolbarProps})}
        </div>
      </ToolbarPortal>
    </div>;
}
