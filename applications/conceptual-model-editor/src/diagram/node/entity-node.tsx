import { useContext } from "react";
import {
  Handle,
  Position,
  NodeToolbar,
  type NodeProps,
  type Node,
  useReactFlow,
} from "@xyflow/react";

import type { Node as ApiNode, EntityItem } from "../diagram-api";
import { DiagramContext } from "../diagram-controller";

import "./entity-node.css";
import { usePrefixForIri } from "../../service/prefix-service";
import { t } from "../../application";
import { useModelGraphContext } from "../../context/model-context";
import { VisualNode } from "@dataspecer/core-v2/visual-model";

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
  const isAnchored = (graph.aggregatorView?.getActiveVisualModel()?.getVisualEntity(props.data.identifier) as VisualNode).position?.anchored ?? false;

  return (
    <>
      {props.selected ? <SelectedHighlight /> : null}
      <div className={"border border-black entity-node min-h-14 min-w-56"}>
        <EntityNodeToolbar {...props} />
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
                {isAnchored ? <div>⚓</div>: null}
            </div>
          </div>

          <div className="overflow-x-clip text-gray-500 px-1">
            {usePrefixForIri(data.iri)}
          </div>

          <ul className="px-1">
            {data.items.map(item =>
              <EntityNodeItem key={item.identifier} item={item} />)}
          </ul>
        </div>
        {/* We need a permanent source and target. */}
        <Handle type="target" position={Position.Right} />
        <Handle type="source" position={Position.Right} />
      </div>
    </>
  );
};

function SelectedHighlight() {
  return (
    <div style={{ position: "fixed", zIndex: -1, left: "-.25em", top: "-.25em", bottom: "-.25em", right: "-.25em" }} className={"entity-node selected"} />
  );
}

function EntityNodeToolbar(props: NodeProps<Node<ApiNode>>) {
  const context = useContext(DiagramContext);
  if(context === null) {
    return null;
  }

  const isCanvasToolbarOpen = context.openedCanvasToolbar !== null;
  if(isCanvasToolbarOpen) {
    return null;
  }

  if(context.shouldShowSelectionToolbar()) {
    return <SelectionToolbar {...props}/>;
  }
  else {
    return <PrimaryNodeToolbar {...props}/>;
  }
}


function PrimaryNodeToolbar(props: NodeProps<Node<ApiNode>>) {
  const context = useContext(DiagramContext);

  const onShowDetail = () => context?.callbacks().onShowNodeDetail(props.data);
  const onEdit = () => context?.callbacks().onEditNode(props.data);
  const onCreateProfile = () => context?.callbacks().onCreateNodeProfile(props.data);
  const onHide = () => context?.callbacks().onHideNode(props.data);
  const onDelete = () => context?.callbacks().onDeleteNode(props.data);
  const onAnchor = () => context?.callbacks().onToggleAnchorForNode(props.data);

  return (
    <>
    <NodeToolbar isVisible={props.selected === true} position={Position.Top} className="flex gap-2 entity-node-toolbar" >
      <button onClick={onShowDetail} title={t("class-detail-button")}>ℹ</button>
      &nbsp;
      <button onClick={onEdit} title={t("class-edit-button")}>✏️</button>
      &nbsp;
      <button onClick={onCreateProfile} title={t("class-profile-button")}>🧲</button>
      &nbsp;
    </NodeToolbar>
    <NodeToolbar isVisible={props.selected === true} position={Position.Right} className="flex gap-2 entity-node-toolbar" >
      <Handle type="source" position={Position.Right} title={t("node-connection-handle")}>🔗</Handle>
    </NodeToolbar>
    <NodeToolbar isVisible={props.selected === true} position={Position.Bottom} className="flex gap-2 entity-node-toolbar" >
      <button onClick={onHide} title={t("class-hide-button")}>🕶</button>
      &nbsp;
      <button onClick={onDelete} title={t("class-remove-button")}>🗑</button>
      &nbsp;
      <button onClick={onAnchor} title={t("node-anchor-button")} >⚓</button>
      &nbsp;
    </NodeToolbar>
  </>);
}


function SelectionToolbar(props: NodeProps<Node<ApiNode>>) {
  const context = useContext(DiagramContext);
  const reactFlow = useReactFlow();
  const isLastSelected = props.selected === true && context?.getLastSelected() === props.id;

  if (!(isLastSelected === true && context?.getLastSelected() === props.id)) {
    return null;
  }

  const onShowSelectionActions = (event: React.MouseEvent) => {
    // TODO: Don't know where to put this conversion line of code -
    //       a) It is probably the best to keep it here.
    //       b) Separate controller for this component - But we have only 1 method
    //       c) Exposing the conversion from screen to canvas position in diagram API - not sure if that is something which should be part of API
    const absoluteFlowPosition = reactFlow.screenToFlowPosition({x: event.clientX, y: event.clientY});
    context?.callbacks().onShowSelectionActions(props.data, absoluteFlowPosition);
  }
  const onLayoutSelection = () => context?.callbacks().onLayoutSelection();
  const onCreateGroup = () => context?.callbacks().onCreateGroup();
  const onShowExpandSelection = () => context?.callbacks().onShowExpandSelection();
  const onShowFilterSelection = () => context?.callbacks().onShowFilterSelection();

  return (<>
    <NodeToolbar isVisible={isLastSelected} position={Position.Top} className="flex gap-2 entity-node-toolbar" >
      <button onClick={onShowSelectionActions} title={t("selection-action-button")}>🎬</button>
      &nbsp;
      <button onClick={onLayoutSelection} title={t("selection-layout-button")} disabled>🔀</button>
      &nbsp;
    </NodeToolbar>
    <NodeToolbar isVisible={isLastSelected} position={Position.Right} className="flex gap-2 entity-node-toolbar" >
    <button onClick={onCreateGroup} title={t("selection-group-button")} disabled>🤝</button>
    </NodeToolbar>
    <NodeToolbar isVisible={isLastSelected} position={Position.Bottom} className="flex gap-2 entity-node-toolbar" >
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
    <li>
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
    </li>
  );
}

export const EntityNodeName = "entity-node";
