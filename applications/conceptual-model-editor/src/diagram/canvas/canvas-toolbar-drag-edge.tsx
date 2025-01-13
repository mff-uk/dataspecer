import { useContext } from "react";

import { DiagramContext } from "../diagram-controller";
import { CanvasMenuContentProps } from "./canvas-toolbar-props";

import "./canvas-toolbar-drag-edge.css";

/**
 * This toolbar represents menu which appears when user drags edge to canvas.
 */
export function CanvasMenuCreatedByEdgeDrag({ menuProps }: { menuProps: CanvasMenuContentProps }) {
  const context = useContext(DiagramContext);

  const onCanvasMenuAddClassDialog = () => {
    context?.closeCanvasMenu();
    context?.callbacks().onCanvasOpenCreateClassDialog(menuProps.sourceNodeIdentifier, menuProps.canvasPosition);
  };

  return <div>
    <ul className="canvas-toolbar-edge-drag">
      <li>
        <button onClick={onCanvasMenuAddClassDialog}>➕</button>
      </li>
    </ul>
  </div>;
}
