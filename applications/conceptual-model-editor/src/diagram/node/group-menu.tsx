import "./group-menu.css";
import { CanvasMenuContentProps as CanvasMenuContentProps } from "../canvas/canvas-toolbar-props";
import { DiagramContext } from "../diagram-controller";
import { useContext } from "react";
import { t } from "../../application";

export function GroupMenu({ menuProps }: { menuProps: CanvasMenuContentProps }) {
  const context = useContext(DiagramContext);

  const onDissolveGroup = () => {
    context?.closeCanvasMenu();
    context?.callbacks().onDissolveGroup(menuProps.sourceNodeIdentifier);
  };
  const onAnchor = () => {
    context?.closeCanvasMenu();
    context?.callbacks().onToggleAnchorForNode(menuProps.sourceNodeIdentifier);
  };

  return (<>
    <ul className="group-menu">
      <li>
        <button onClick={onDissolveGroup} title={t("dissolve-group-button")}>❌</button>
        <button onClick={onAnchor} title={t("group-anchor-button")} >⚓</button>
      </li>
    </ul>
  </>);
}
