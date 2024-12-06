import { useContext } from "react";

import { DiagramContext, EdgeType, NodeType } from "../diagram-controller";
import { CanvasToolbarGeneralProps } from "./canvas-toolbar-props";

import "./canvas-toolbar-drag-edge.css";
import { ReactFlowInstance, useReactFlow } from "@xyflow/react";

/**
 * As we can not render menu on a single place, like node menu, we
 * extracted the menu into a separate component.
 */
export function CanvasToolbarCreatedByEdgeDrag({ value }: { value: CanvasToolbarGeneralProps | null }) {
  const context = useContext(DiagramContext);
  const reactFlow: ReactFlowInstance<NodeType, EdgeType> = useReactFlow();

  if (value === null || value.toolbarType !== "EDGE-DRAG-CANVAS-MENU-TOOLBAR") {
    return null;
  }

  const onCanvasMenuAddClassDialog = () => {
    const node = reactFlow.getNode(value.sourceNodeIdentifier);
    if(node !== undefined) {
      context?.callbacks().onCanvasOpenCreateClassDialog(node.data, value.abosluteFlowPosition);
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
