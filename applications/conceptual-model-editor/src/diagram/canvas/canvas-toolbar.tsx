import { useContext } from "react";

import { DiagramContext } from "../diagram-controller";
import { CanvasToolbarPortal } from "./canvas-toolbar-portal";
import { CanvasToolbarProps, viewportStoreSelector } from "./canvas-toolbar-props";


// Inspired by edge-toolbar.ts

/**
 * As we can not render edge menu on a single place, like node menu, we
 * extracted the menu into a separate component.
 */
export function CanvasToolbar({ value }: { value: CanvasToolbarProps | null }) {
  const context = useContext(DiagramContext);
  if (value === null) {
    return null;
  }

  const onCanvasMenuAddClassDialog = () => {
    value.closeCanvasToolbar();
    context?.callbacks().onCanvasOpenCreateClassDialog(value.sourceClassNode);
  };
  const onCanvasMenuAddClassDialogAndThenOpenCreateConnectionDialog = () => {
    value.closeCanvasToolbar();
    alert("Open add class dialog and then right after that open create connection dialog.");
  };
  const onCanvasMenuChooseConnectionTargetFromExisitngClasses = () => {
    value.closeCanvasToolbar();
    alert("Open list of classes and choose class which you want to be the target class of connection.");
  };


  return (
    <>
      <CanvasToolbarPortal>
        {/* There is no need for conversion like in case of edge toolbar, we can use the given coordinates */}
        <div className="canvas-toolbar" style={{ transform: `translate(${value.x}px, ${value.y}px)` }}>
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
