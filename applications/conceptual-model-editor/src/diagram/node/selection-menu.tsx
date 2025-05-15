import { Node, NodeProps, NodeToolbar, Position, useReactFlow } from "@xyflow/react";
import { useContext } from "react";
import { DiagramContext } from "../diagram-controller";
import { t } from "@/application";
import { DiagramNodeTypes } from "../diagram-model";

import "./entity-node.css";

export function SelectionMenu(props: NodeProps<Node<DiagramNodeTypes>>) {
  const context = useContext(DiagramContext);
  const reactFlow = useReactFlow();
  const shouldShowMenu = context?.getNodeWithMenu() === props.id;

  if (!shouldShowMenu) {
    return null;
  }

  const onShowSelectionActions = (event: React.MouseEvent) => {
    const absoluteFlowPosition = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    context?.callbacks().onShowSelectionActionsMenu(props.data, absoluteFlowPosition);
  }
  const onLayoutSelection = () => context?.callbacks().onLayoutSelection();
  const onCreateGroup = () => {
    context?.callbacks().onCreateGroup();
  };
  const onShowExpandSelection = () => context?.callbacks().onShowExpandSelection();
  const onShowFilterSelection = () => context?.callbacks().onShowFilterSelection();
  const onCreateVisualDiagramNode = () => context?.callbacks().onCreateVisualModelDiagramNodeFromSelection();

  return (<>
    <NodeToolbar isVisible={shouldShowMenu} position={Position.Top} className="flex gap-2 entity-node-menu" >
      <button onClick={onShowSelectionActions} title={t("selection-action-button")}>🎬</button>
      &nbsp;
      <button onClick={onLayoutSelection} title={t("selection-layout-button")} disabled>🔀</button>
      &nbsp;
    </NodeToolbar>
    <NodeToolbar isVisible={shouldShowMenu} position={Position.Right} className="flex gap-2 entity-node-menu" >
      <button onClick={onCreateGroup} title={t("selection-group-button")}>⛓️</button>
    </NodeToolbar>
    <NodeToolbar isVisible={shouldShowMenu} position={Position.Bottom} className="flex gap-2 entity-node-menu" >
      <button onClick={onShowExpandSelection} title={t("selection-extend-button")} >📈</button>
      &nbsp;
      <button onClick={onShowFilterSelection} title={t("selection-filter-button")} >📉</button>
      &nbsp;
    </NodeToolbar>
  </>
  );
}