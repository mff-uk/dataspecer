import "./selection-actions-menu.css";
import { CanvasMenuContentProps } from "../canvas/canvas-menu-props";
import { DiagramContext } from "../diagram-controller";
import { useContext } from "react";
import { t } from "../../application";

/**
 * This is react component representing toolbar menu, which appears when user clicks on the actions button on selection.
 */
export function SelectionActionsMenu(_: { menuProps: CanvasMenuContentProps }) {
  const context = useContext(DiagramContext);
  const onCreateNewView = () => {
    context?.closeCanvasMenu();
    context?.callbacks().onCreateNewViewFromSelection();
  };
  const onProfileSelection = () => {
    context?.closeCanvasMenu();
    context?.callbacks().onProfileSelection();
  };
  const onHideSelection = () => {
    context?.closeCanvasMenu();
    context?.callbacks().onHideSelection();
  };
  const onRemoveSelection = () => {
    context?.closeCanvasMenu();
    context?.callbacks().onDeleteSelection();
  };

  return (<>
    <ul className="node-secondary-menu">
      <li>
        <button onClick={onCreateNewView} title={t("selection-new-view-button")}>🖼️</button>
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
