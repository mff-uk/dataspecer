import "./group-menu.css";
import { CanvasToolbarContentProps } from "../canvas/canvas-toolbar-props";
import { DiagramContext } from "../diagram-controller";
import { useContext } from "react";
import { t } from "../../application";
import { useReactFlow } from "@xyflow/react";

// TODO RadStr: Rename every toolbar to menu
export function GroupMenu({ toolbarProps }: { toolbarProps: CanvasToolbarContentProps }) {
  const context = useContext(DiagramContext);
  const reactFlow = useReactFlow();

  const onShowGroupActions = (event: React.MouseEvent) => {
    const absoluteFlowPosition = reactFlow.screenToFlowPosition({x: event.clientX, y: event.clientY});
    // TODO RadStr:
    // context?.callbacks().onShowGroupActionsMenu(toolbarProps.sourceNodeIdentifier, absoluteFlowPosition);
    alert("Showing gorup actions menu");
  }
  const onLayoutGroup = () => context?.callbacks().onLayoutSelection();
  const onDissolveGroup = () => {
    alert("Dissolving group");
    context?.callbacks().onDissolveGroup(toolbarProps.sourceNodeIdentifier);
  };
  const onShowExpandSelection = () => context?.callbacks().onShowExpandSelection();
  const onShowFilterSelection = () => context?.callbacks().onShowFilterSelection();

  return (<>
    <ul className="group-menu">
      <li>
        <button onClick={onShowGroupActions} title={t("selection-action-button")}>🎬</button>
      </li>
      <li>
        <button onClick={onLayoutGroup} title={t("selection-layout-button")} disabled>🔀</button>
      </li>
      <li>
        <button onClick={onShowExpandSelection} title={t("selection-extend-button")} >📈</button>
      </li>
      <li>
        <button onClick={onShowFilterSelection} title={t("selection-filter-button")} >📉</button>
      </li>
      <li>
        <button onClick={onDissolveGroup} title={t("dissolve-group-button")}>❌</button>
      </li>
    </ul>
  </>);
}