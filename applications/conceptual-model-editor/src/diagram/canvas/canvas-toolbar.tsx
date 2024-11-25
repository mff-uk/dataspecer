import { useContext } from "react";
import { shallow } from "zustand/shallow";
import { useStore } from "@xyflow/react";

import { DiagramContext } from "../diagram-controller";
import { CanvasToolbarPortal } from "./canvas-toolbar-portal";
import { CanvasToolbarProps as CanvasToolbarGeneralProps, viewportStoreSelector } from "./canvas-toolbar-props";
import { computePosition } from "../edge/edge-utilities";


// Inspired by edge-toolbar.ts

/**
 * As we can not render menu on a single place, like node menu, we
 * extracted the menu into a separate component.
 */
export function CanvasToolbarGeneral({ value }: { value: CanvasToolbarGeneralProps | null }) {
  const context = useContext(DiagramContext);
  const { x, y, zoom } = useStore(viewportStoreSelector, shallow);
  if (value === null) {
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

  const position = computePosition(value.abosluteFlowPosition.x, value.abosluteFlowPosition.y, { x, y, zoom });

  return (
    <>
      <CanvasToolbarPortal>
        <div className="canvas-toolbar" style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
          <ul className="canvas-toolbar">
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
        </div>
      </CanvasToolbarPortal>
    </>
  );
}
