import "./selection-actions-menu.css";
import { CanvasToolbarContentProps } from "../canvas/canvas-toolbar-props";
import { DiagramContext } from "../diagram-controller";
import { useContext } from "react";
import { t } from "../../application";

/**
 * This is react component representing toolbar menu, which appears when user clicks on the actions button on selection.
 */
export function SelectionActionsMenu(_: { toolbarProps: CanvasToolbarContentProps }) {
  const context = useContext(DiagramContext);
  const onCreateNewView = () => {
    context?.closeCanvasToolbar();
    context?.callbacks().onCreateNewViewFromSelection();
  };
  const onProfileSelection = () => {
    context?.closeCanvasToolbar();
    context?.callbacks().onProfileSelection();
  };
  const onHideSelection = () => {
    context?.closeCanvasToolbar();
    context?.callbacks().onHideSelection();
  };
  const onRemoveSelection = () => {
    context?.closeCanvasToolbar();
    context?.callbacks().onDeleteSelection();
  };

  return (<>
    <ul className="node-secondary-toolbar">
      <li>
        <button onClick={onCreateNewView} title={t("selection-new-view-button")} disabled >🖼️</button>
      </li>
      <li>
        <button onClick={onProfileSelection} title={t("selection-profile-button")}>🧲</button>
      </li>
      <li>
        <button onClick={onHideSelection} title={t("selection-hide-button")}>🕶️</button>
      </li>
      <li>
        <button onClick={onRemoveSelection} title={t("selection-remove-button")}>🗑️</button>
      </li>
    </ul>
  </>);
}
