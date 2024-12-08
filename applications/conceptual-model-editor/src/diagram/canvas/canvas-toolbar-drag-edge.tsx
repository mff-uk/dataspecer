import { useContext } from "react";

import { DiagramContext, EdgeType, NodeType } from "../diagram-controller";
import { CanvasToolbarContentProps } from "./canvas-toolbar-props";

import "./canvas-toolbar-drag-edge.css";
import { ReactFlowInstance, useReactFlow } from "@xyflow/react";

/**
 * This toolbar represents menu which appears when user drags edge to canvas.
 */
export function CanvasToolbarCreatedByEdgeDrag({ value }: { value: CanvasToolbarContentProps }) {
  const context = useContext(DiagramContext);
  const reactFlow: ReactFlowInstance<NodeType, EdgeType> = useReactFlow();

  const onCanvasMenuAddClassDialog = () => {
    context?.closeCanvasToolbar();
    const node = reactFlow.getNode(value.sourceNodeIdentifier);
    if(node !== undefined) {
      context?.callbacks().onCanvasOpenCreateClassDialog(node.data, value.canvasPosition);
    }
  };

  return <div>
        <ul className="canvas-toolbar-edge-drag">
            <li>
                <button onClick={onCanvasMenuAddClassDialog}>➕</button>
            </li>
        </ul>
    </div>;
}
