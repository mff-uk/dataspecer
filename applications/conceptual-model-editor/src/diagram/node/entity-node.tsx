import { useContext } from "react";
import {
  Handle,
  type Node,
  type NodeProps,
  NodeToolbar,
  Position,
  useReactFlow,
} from "@xyflow/react";

import type { Node as ApiNode, EntityItem } from "../diagram-api";
import { DiagramContext, NodeMenuType } from "../diagram-controller";

import "./entity-node.css";
import { usePrefixForIri } from "../../service/prefix-service";
import { t } from "../../application";
import { useModelGraphContext } from "../../context/model-context";
import { VisualNode } from "@dataspecer/core-v2/visual-model";
import { useActions } from "../../action/actions-react-binding";

// We can select zoom option and hide content when zoom is on given threshold.
// const zoomSelector = (state: ReactFlowState) => state.transform[2] >= 0.9;
// Following in the entity:
// const showContent = useStore(zoomSelector);

export const EntityNode = (props: NodeProps<Node<ApiNode>>) => {
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

  // TODO RadStr: Not sure if we should access the actions here or through another method
  const actions = useActions();
  const removeAttributeFromVisualModel = (attribute: string) => actions.removeAttributesFromVisualModel([attribute]);
  const moveAttributeUp = (attribute: string) =>  actions.shiftAttributeUp(attribute, props.data.identifier);
  const moveAttributeDown = (attribute: string) =>  actions.shiftAttributeDown(attribute, props.data.identifier);

  return (
    <>
      <div className={"border border-black entity-node min-h-14 min-w-56"}>
        <EntityNodeMenu {...props} />
        <div className="entity-node-content">

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
          {data.items.map(item =>
          {
            return <li className="relative flex w-full flex-row justify-between z-50">
              <EntityNodeItem key={item.identifier} item={item} />
              {props.selected !== true ? null :
                <div>
                  <button onClick={(_) => moveAttributeUp(item.identifier)}>🔼</button>
                  <button onClick={(_) => moveAttributeDown(item.identifier)}>🔽</button>
                  <button onClick={(_) => removeAttributeFromVisualModel(item.identifier)}>🕶️</button>
                </div>
              }
            </li>
          })
          }
        </div>
        {/* We need a permanent source and target. */}
        <Handle type="target" position={Position.Right} />
        <Handle type="source" position={Position.Right} />
      </div>
    </>
  );
};

function EntityNodeMenu(props: NodeProps<Node<ApiNode>>) {
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
    return <PrimaryNodeMenu {...props}/>;
  }
  else {
    console.error("Missing node menu");
    return null;
  }
}

function PrimaryNodeMenu(props: NodeProps<Node<ApiNode>>) {
  const context = useContext(DiagramContext);

  const isPartOfGroup = props.data.group !== null;

  const onShowDetail = () => context?.callbacks().onShowNodeDetail(props.data);
  const onEdit = () => context?.callbacks().onEditNode(props.data);
  const onCreateProfile = () => context?.callbacks().onCreateNodeProfile(props.data);
  const onHide = () => context?.callbacks().onHideNode(props.data);
  const onDelete = () => context?.callbacks().onDeleteNode(props.data);
  const onAnchor = () => context?.callbacks().onToggleAnchorForNode(props.data.identifier);
  const onDissolveGroup = () => context?.callbacks().onDissolveGroup(props.data.group);
  const onAddAttribute = () => context?.callbacks().onAddAttributeForNode(props.data);

  // TODO RadStr: Create OnEditAttributesForNode method
  const {openEditNodeAttributesDialog} = useActions();
  const onEditAttributes = () => openEditNodeAttributesDialog(props.id) ;

  const shouldShowToolbar = props.selected === true;

  const addAttributeTitle = props.data.profileOf === null ?
    t("node-add-attribute") : t("node-add-attribute-profile");

  return (
    <>
      <NodeToolbar isVisible={shouldShowToolbar} position={Position.Top} className="flex gap-2 entity-node-menu" >
        <button onClick={onShowDetail} title={t("class-detail-button")}>ℹ</button>
        &nbsp;
        <button onClick={onEdit} title={t("class-edit-button")}>✏️</button>
        &nbsp;
        <button onClick={onCreateProfile} title={t("class-profile-button")}>🧲</button>
        &nbsp;
      </NodeToolbar>
      <NodeToolbar isVisible={shouldShowToolbar} position={Position.Right} className="flex gap-2 entity-node-menu" >
        <Handle type="source" position={Position.Right} title={t("node-connection-handle")}>🔗</Handle>
      </NodeToolbar>
      {
        !isPartOfGroup ? null :
          <NodeToolbar isVisible={shouldShowToolbar} position={Position.Left} className="flex gap-2 entity-node-menu" >
            <button onClick={onDissolveGroup} title={t("dissolve-group-button")}>❌</button>
          </NodeToolbar>
      }
      <NodeToolbar isVisible={shouldShowToolbar} position={Position.Bottom} className="flex gap-2 entity-node-menu" >
        <button onClick={onHide} title={t("class-hide-button")}>🕶</button>
        &nbsp;
        <button onClick={onDelete} title={t("class-remove-button")}>🗑</button>
        &nbsp;
        <button onClick={onAnchor} title={isPartOfGroup ? t("group-anchor-button") : t("node-anchor-button")} >⚓</button>
        &nbsp;
        <button onClick={onAddAttribute} title={addAttributeTitle} >➕</button>
        &nbsp;
        <button onClick={onEditAttributes}>Edit Attributes</button>
        &nbsp;
      </NodeToolbar>
    </>);
}

function SelectionMenu(props: NodeProps<Node<ApiNode>>) {
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

  return (<>
    <NodeToolbar isVisible={shouldShowMenu} position={Position.Top} className="flex gap-2 entity-node-menu" >
      <button onClick={onShowSelectionActions} title={t("selection-action-button")}>🎬</button>
      &nbsp;
      <button onClick={onLayoutSelection} title={t("selection-layout-button")} disabled>🔀</button>
      &nbsp;
    </NodeToolbar>
    <NodeToolbar isVisible={shouldShowMenu} position={Position.Right} className="flex gap-2 entity-node-menu" >
      <button onClick={onCreateGroup} title={t("selection-group-button")}>🤝</button>
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

function EntityNodeItem({ item }: {
  item: EntityItem,
}) {

  let usageNote: undefined | string = undefined;
  if (item.profileOf !== null && item.profileOf.usageNote !== null) {
    usageNote = item.profileOf.usageNote;
  }

  return (
    <div>
      <span>
        - {item.label}
      </span>
      {item.profileOf === null ? null : (
        <>
          &nbsp;
          <span className="text-gray-600 underline" title={usageNote}>
            profile
          </span>
          &nbsp;of&nbsp;
          <span>
            {item.profileOf.label}
          </span>
        </>
      )}
    </div>
  );
}

export const EntityNodeName = "entity-node";
