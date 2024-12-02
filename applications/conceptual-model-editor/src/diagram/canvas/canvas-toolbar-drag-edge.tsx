import { useContext } from "react";

import { DiagramContext, EdgeType, NodeType } from "../diagram-controller";
import { CanvasToolbarGeneralProps } from "./canvas-toolbar-props";

import "./canvas-toolbar-drag-edge.css";
import { ReactFlowInstance, useReactFlow } from "@xyflow/react";

// Inspired by edge-toolbar.ts

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
    const node = reactFlow.getNode(value.sourceClassNodeIdentifier);
    if(node !== undefined) {
      context?.callbacks().onCanvasOpenCreateClassDialog(node.data, value.abosluteFlowPosition);
    }
  };
  const onCanvasMenuChooseConnectionTargetFromExisitngClasses = () => {
    alert("Open list of classes and choose class which you want to be the target class of connection.");
  };


  return <div>
        <ul className="canvas-toolbar-edge-drag">
            <li>
                <button onClick={onCanvasMenuAddClassDialog}>➕</button>
            </li>
            <li>
                <button onClick={onCanvasMenuChooseConnectionTargetFromExisitngClasses}>🕮</button>
            </li>
        </ul>
    </div>;
}
