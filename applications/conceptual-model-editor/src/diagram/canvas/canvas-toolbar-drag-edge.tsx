import { useContext } from "react";

import { DiagramContext, EdgeType, NodeType } from "../diagram-controller";
import { CanvasToolbarContentProps } from "./canvas-toolbar-props";

import "./canvas-toolbar-drag-edge.css";
import { ReactFlowInstance, useReactFlow } from "@xyflow/react";

/**
 * This toolbar represents menu which appears when user drags edge to canvas.
 */
export function CanvasToolbarCreatedByEdgeDrag({ toolbarProps }: { toolbarProps: CanvasToolbarContentProps }) {
  const context = useContext(DiagramContext);

  const onCanvasMenuAddClassDialog = () => {
    context?.closeCanvasToolbar();
    context?.callbacks().onCanvasOpenCreateClassDialog(toolbarProps.sourceNodeIdentifier, toolbarProps.canvasPosition);
  };

  return <div>
    <ul className="canvas-toolbar-edge-drag">
      <li>
        <button onClick={onCanvasMenuAddClassDialog}>➕</button>
      </li>
    </ul>
  </div>;
}
