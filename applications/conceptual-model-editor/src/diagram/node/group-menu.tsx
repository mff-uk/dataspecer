import "./group-menu.css";
import { CanvasToolbarContentProps } from "../canvas/canvas-toolbar-props";
import { DiagramContext } from "../diagram-controller";
import { useContext } from "react";
import { t } from "../../application";

// TODO RadStr: Rename every toolbar to menu
export function GroupMenu({ toolbarProps }: { toolbarProps: CanvasToolbarContentProps }) {
  const context = useContext(DiagramContext);

  const onDissolveGroup = () => {
    context?.closeCanvasToolbar();
    context?.callbacks().onDissolveGroup(toolbarProps.sourceNodeIdentifier);
  };
  const onAnchor = () => {
    context?.closeCanvasToolbar();
    context?.callbacks().onToggleAnchorForNode(toolbarProps.sourceNodeIdentifier);
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
