import "./node-secondary-toolbar.css";
import { CanvasToolbarGeneralProps } from "../canvas/canvas-toolbar-props";
import { DiagramContext } from "../diagram-controller";
import { useContext } from "react";

export function NodeSelectionActionsSecondaryToolbar({ value }: { value: CanvasToolbarGeneralProps | null }) {
    if(value === null || value.toolbarType !== "NODE-SELECTION-ACTIONS-SECONDARY-TOOLBAR") {
        return null;
    }

    const context = useContext(DiagramContext);
    const onCreateNewView = () => context?.callbacks().onCreateNewViewFromSelection();
    const onProfileSelection = () => context?.callbacks().onProfileSelection();
    const onHideSelection = () => context?.callbacks().onHideSelection();
    const onRemoveSelection = () => context?.callbacks().onDeleteSelection();


    return (<>
        <ul className="node-secondary-toolbar">
            <li>
                <button onClick={onCreateNewView}>🖼️</button>
            </li>
            <li>
                <button onClick={onProfileSelection}>🧲</button>
            </li>
            <li>
                <button onClick={onHideSelection}>🕶️</button>
            </li>
            <li>
                <button onClick={onRemoveSelection}>🗑️</button>
            </li>
        </ul>
    </>);
  }
