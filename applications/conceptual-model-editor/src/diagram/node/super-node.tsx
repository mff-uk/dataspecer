// TODO RadStr: Clean-up this whole file

import { useContext } from "react";
import {
  Handle,
  type Node,
  type NodeProps,
  NodeToolbar,
  Position,
  useReactFlow,
} from "@xyflow/react";

import type { DiagramSuperNode, EntityItem } from "../diagram-api";
import { DiagramContext, NodeMenuType } from "../diagram-controller";

// TODO RadStr: we are reusing the entity-node.css for the menus, so there is no need for it to be in the super-node.tsx
import "./super-node.css";
import { usePrefixForIri } from "../../service/prefix-service";
import { t } from "../../application";
import { useModelGraphContext } from "../../context/model-context";
import { VisualNode } from "@dataspecer/core-v2/visual-model";
import { useActions } from "../../action/actions-react-binding";

// We can select zoom option and hide content when zoom is on given threshold.
// const zoomSelector = (state: ReactFlowState) => state.transform[2] >= 0.9;
// Following in the entity:
// const showContent = useStore(zoomSelector);

export const SuperNode = (props: NodeProps<Node<DiagramSuperNode>>) => {
  // We can use the bellow to set size based on the content.
  // useLayoutEffect(() => {
  //   if (inputRef.current) {
  //     inputRef.current.style.width = `${data.label.length * 8}px`;
  //   }
  // }, [data.label.length]);

  // We can use bellow to get information about active connection
  // and for example highligh possible targets.
  // const connection = useConnection()

  const data = props.data;

  const description: undefined | string = data.description ?? undefined;

  let usageNote: undefined | string = undefined;
  if (data.profileOf !== null && data.profileOf.usageNote !== null) {
    usageNote = data.profileOf.usageNote;
  }

  // TODO PRQuestion: How should we get access to the information saying that the node is anchored so we can visualize it? Should it be action? Or should it be like this?
  const graph = useModelGraphContext();
  const isAnchored = (graph.aggregatorView?.getActiveVisualModel()?.getVisualEntity(props.data.identifier) as VisualNode)?.position?.anchored ?? false;

  // TODO RadStr: Not sure if we should access the actions here or through another method defined in diagram-api
  const actions = useActions();

  // TODO RadStr: externalIdentifier maybe should be Id of the model?
  return (
    <div className="superNode">


      {/* <div className={"border border-black min-h-14 min-w-56"}> */}
      <div>
        <EntityNodeMenu {...props} />
        <div className="relative flex w-full flex-row justify-between">
          <div>{data.label}</div>
          {isAnchored ? <div>⚓</div> : null}
        </div>
        <div className="overflow-x-clip text-gray-500 px-1">
          {`Represents ${props.data.representedModelAlias}`}
        </div>

        {/* <div className="entity-node-content">

          <div className="drag-handle bg-slate-300 p-1"
            style={{ backgroundColor: data.color }}
            title={description}
          >
            {data.profileOf === null ? null : (
              <div className="text-gray-600">
                <span className="underline" title={usageNote}>
                  profile
                </span>
                &nbsp;of&nbsp;
                <span>
                  {data.profileOf.label}
                </span>
              </div>
            )}
            <div className="relative flex w-full flex-row justify-between">
              <div>{data.label}</div>
              {isAnchored ? <div>⚓</div> : null}
            </div>
          </div>

          <div className="overflow-x-clip text-gray-500 px-1">
            {usePrefixForIri(data.iri)}
          </div>
        </div> */}
        <Handle type="target" position={Position.Right} />
        <Handle type="source" position={Position.Right} />
      </div>
    </div>
  );
};

function EntityNodeMenu(props: NodeProps<Node<DiagramSuperNode>>) {
  const context = useContext(DiagramContext);
  if (context === null) {
    return null;
  }

  const isCanvasToolbarOpen = context.openedCanvasMenu !== null;
  if (isCanvasToolbarOpen) {
    return null;
  }

  if (context.getShownNodeMenuType() === NodeMenuType.SELECTION_MENU) {
    return <SelectionMenu {...props}/>;
  }
  else if (context.getShownNodeMenuType() === NodeMenuType.SINGLE_NODE_MENU) {
    return <PrimarySuperNodeMenu {...props}/>;
  }
  else {
    console.error("Missing node menu");
    return null;
  }
}

function PrimarySuperNodeMenu(props: NodeProps<Node<DiagramSuperNode>>) {
  const context = useContext(DiagramContext);

  const isPartOfGroup = props.data.group !== null;

  const onMoveToSourceVisualModel = () => context?.callbacks().onMoveToSourceVisualModelOfSuperNode(props.data.identifier);
  const onEditSuperNode = () => context?.callbacks().onEditSuperNode(props.data);
  const onHideSuperNode = () => context?.callbacks().onHideSuperNode(props.data);
  const onDissolveSuperNode = () => context?.callbacks().onDissolveSuperNode(props.data.identifier);

  const onAnchor = () => context?.callbacks().onToggleAnchorForNode(props.data.identifier);
  const onDissolveGroup = () => context?.callbacks().onDissolveGroup(props.data.group);

  const shouldShowToolbar = props.selected === true;

  return (
    <>
      <NodeToolbar isVisible={shouldShowToolbar} position={Position.Top} className="flex gap-2 entity-node-menu" >
        <button onClick={onMoveToSourceVisualModel} title={t("super-node-move-to-source-visual-model-button")}>🗺️</button>
        &nbsp;
        <button onClick={onEditSuperNode} title={t("super-node-edit-button")}>✏️</button>
        &nbsp;
      </NodeToolbar>
      <NodeToolbar isVisible={shouldShowToolbar} position={Position.Right} className="flex gap-2 entity-node-menu" >
        <Handle type="source" position={Position.Right} title={t("node-connection-handle")}>🔗</Handle>
      </NodeToolbar>
      {
        !isPartOfGroup ? null :
          <NodeToolbar isVisible={shouldShowToolbar} position={Position.Left} className="flex gap-2 entity-node-menu" >
            <button onClick={onDissolveGroup} title={t("dissolve-group-button")}>⛓️‍💥</button>
          </NodeToolbar>
      }
      <NodeToolbar isVisible={shouldShowToolbar} position={Position.Bottom} className="flex gap-2 entity-node-menu" >
        <button onClick={onHideSuperNode} title={t("super-node-hide-button")}>🕶</button>
        &nbsp;
        <button onClick={onAnchor} title={isPartOfGroup ? t("group-anchor-button") : t("node-anchor-button")} >⚓</button>
        &nbsp;
        <button onClick={onDissolveSuperNode} title={t("super-node-dissolve-button")} >💥</button>
        &nbsp;
      </NodeToolbar>
    </>);
}

function SelectionMenu(props: NodeProps<Node<DiagramSuperNode>>) {
  const context = useContext(DiagramContext);
  const reactFlow = useReactFlow();
  const shouldShowMenu = context?.getNodeWithMenu() === props.id;

  if (!shouldShowMenu) {
    return null;
  }

  const onShowSelectionActions = (event: React.MouseEvent) => {
    const absoluteFlowPosition = reactFlow.screenToFlowPosition({x: event.clientX, y: event.clientY});
    context?.callbacks().onShowSelectionActionsMenu(props.data, absoluteFlowPosition);
  }
  const onLayoutSelection = () => context?.callbacks().onLayoutSelection();
  const onCreateGroup = () => {
    context?.callbacks().onCreateGroup();
  };
  const onShowExpandSelection = () => context?.callbacks().onShowExpandSelection();
  const onShowFilterSelection = () => context?.callbacks().onShowFilterSelection();

  const onCreateSuperNode = () => context.callbacks().onCreateSuperNode();

  return (<>
    <NodeToolbar isVisible={shouldShowMenu} position={Position.Top} className="flex gap-2 entity-node-menu" >
      <button onClick={onShowSelectionActions} title={t("selection-action-button")}>🎬</button>
      &nbsp;
      <button onClick={onLayoutSelection} title={t("selection-layout-button")} disabled>🔀</button>
      &nbsp;
    </NodeToolbar>
    <NodeToolbar isVisible={shouldShowMenu} position={Position.Left} className="flex gap-2 entity-node-menu" >
      <button onClick={onCreateSuperNode} title={"TODO RadStr: change"}>✂️</button>
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

export const SuperNodeName = "super-node";
