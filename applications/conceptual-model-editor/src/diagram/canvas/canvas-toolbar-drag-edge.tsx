import { useContext } from "react";

import { DiagramContext } from "../diagram-controller";
import { CanvasToolbarGeneralProps } from "./canvas-toolbar-props";

import "./canvas-toolbar-drag-edge.css";

// Inspired by edge-toolbar.ts

/**
 * As we can not render menu on a single place, like node menu, we
 * extracted the menu into a separate component.
 */
export function CanvasToolbarCreatedByEdgeDrag({ value }: { value: CanvasToolbarGeneralProps | null }) {
  const context = useContext(DiagramContext);
  if (value === null || value.toolbarType !== "EDGE-DRAG-CANVAS-MENU-TOOLBAR") {
    return null;
  }

  const onCanvasMenuAddClassDialog = () => {
    value.closeCanvasToolbar();
    context?.callbacks().onCanvasOpenCreateClassDialog(value.sourceClassNode, value.abosluteFlowPosition);
  };
  const onCanvasMenuAddClassDialogAndThenOpenCreateConnectionDialog = () => {
    value.closeCanvasToolbar();
    alert("Open add class dialog and then right after that open create connection dialog.");
  };
  const onCanvasMenuChooseConnectionTargetFromExisitngClasses = () => {
    value.closeCanvasToolbar();
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
            <li>
                <button onClick={onCanvasMenuAddClassDialogAndThenOpenCreateConnectionDialog}>➕🔗</button>
            </li>
        </ul>
    </div>;
}
