import { shallow } from "zustand/shallow";
import { useStore } from "@xyflow/react";

import { ToolbarPortal } from "./toolbar-portal";
import { CanvasToolbarContentType, CanvasToolbarGeneralProps, viewportStoreSelector } from "./canvas-toolbar-props";
import { computePosition } from "../edge/edge-utilities";

type CanvasToolbarGeneralComponentProps = {
  value: CanvasToolbarGeneralProps | null;
  canvasContent: CanvasToolbarContentType;
};

/**
 * This is general component. The purpose is to show given {@link canvasContent} component on position
 * stored inside {@link value}
 */
export function CanvasToolbarGeneral({ value, canvasContent }: CanvasToolbarGeneralComponentProps) {
  const { x, y, zoom } = useStore(viewportStoreSelector, shallow);

  if (value === null) {
    return null;
  }

  const position = computePosition(value.canvasPosition.x, value.canvasPosition.y, { x, y, zoom });

  return <div>
    <ToolbarPortal>
      <div className="canvas-toolbar" style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
        {canvasContent({value})}
      </div>
    </ToolbarPortal>
  </div>;
}
