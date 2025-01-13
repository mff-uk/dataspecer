import type React from "react";
import { useCallback, useEffect, useState, useMemo, createContext, useRef } from "react";
import {
  useReactFlow,
  useNodesState,
  useEdgesState,
  useOnSelectionChange,
  applyNodeChanges,
  applyEdgeChanges,
  type ReactFlowInstance,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type OnSelectionChangeParams,
  type OnConnectStart,
  type OnConnectEnd,
  type IsValidConnection,
  type FinalConnectionState,
  MarkerType,
  useKeyPress,
  NodeSelectionChange,
} from "@xyflow/react";

import { type UseDiagramType } from "./diagram-hook";
import {
  type DiagramActions,
  type DiagramCallbacks,
  type Node as ApiNode,
  type Edge as ApiEdge,
  type ViewportDimensions,
  EdgeType as ApiEdgeType,
  Position,
  GroupWithContent,
} from "./diagram-api";
import { type EdgeToolbarProps } from "./edge/edge-toolbar";
import { EntityNodeName } from "./node/entity-node";
import { PropertyEdgeName } from "./edge/property-edge";

import { type AlignmentController, useAlignmentController } from "./features/alignment-controller-v2";
import { GeneralizationEdgeName } from "./edge/generalization-edge";
import { ClassProfileEdgeName } from "./edge/class-profile-edge";
import { diagramContentAsSvg } from "./render-svg";
import { CanvasMenuContentType } from "./canvas/canvas-toolbar-props";
import { CanvasMenuCreatedByEdgeDrag } from "./canvas/canvas-toolbar-drag-edge";
import { SelectionActionsMenu } from "./node/selection-actions-menu";
import { setHighlightingStylesBasedOnSelection } from "./features/highlighting/set-selection-highlighting-styles";
import { useExplorationCanvasHighlightingController } from "./features/highlighting/exploration/canvas/canvas-exploration-highlighting-controller";
import { ReactPrevSetStateType } from "./utilities";
import { GroupMenu } from "./node/group-menu";
import { findTopLevelGroup } from "../action/utilities";
import { GeneralCanvasMenuComponentProps } from "./canvas/canvas-toolbar-general";

const getTopLeftPosition = (nodes: Node<any>[]) => {
  const topLeft = {x: 10000000, y: 10000000};
  nodes.forEach(node => {
    if(node.position.x < topLeft.x) {
      topLeft.x = node.position.x;
    }
    if(node.position.y < topLeft.y) {
      topLeft.y = node.position.y;
    }
  });

  return topLeft;
};

const getBotRightPosition = (nodes: Node<any>[]) => {
  const botRight = {x: -10000000, y: -10000000};
  nodes.forEach(node => {
    const x = node.position.x + (node.measured?.width ?? 0);
    if(x > botRight.x) {
      botRight.x = x;
    }
    const y = node.position.y + (node.measured?.height ?? 0);
    if(y > botRight.y) {
      botRight.y = y;
    }
  });

  return botRight;
};

const backgroundColorOfShownGroupNode = "rgba(255, 0, 255, 0.04)";

function hideGroupNode(groupNode: Node<any>) {
  return changeGroupNodeVisibility(groupNode, false);
}

function showGroupNode(groupNode: Node<any>, groups: Record<string, NodeIdentifierWithType[]>, nodes: Node<any>[]) {
  const newGroupNode = changeGroupNodeVisibility(groupNode, true);
  const flattenedGroup = flattenGroupStructure([groupNode.id], groups);
  const nodesInGroup = nodes.filter(node => flattenedGroup.includes(node.id));
  const groupNodePosition = getTopLeftPosition(nodesInGroup);
  const botRightGroupNodePosition = getBotRightPosition(nodesInGroup);
  // We have to also set the position, keeping the old one is not enough -
  // because for example layouting was performed or group was dissolved,
  // therefore the old position is incorrect since only the position of the dissolved group was changed on dragging
  newGroupNode.position = groupNodePosition;
  newGroupNode.width = botRightGroupNodePosition.x - groupNodePosition.x;
  newGroupNode.height = botRightGroupNodePosition.y - groupNodePosition.y;
  return newGroupNode;
}

function changeGroupNodeVisibility(groupNode: Node<any>, show: boolean) {
  return {
    ...groupNode,
    hidden: !show,
  };
}

const createGroupNode = (groupId: string, content: Node<any>[], hidden: boolean) => {
  const groupNodePosition = getTopLeftPosition(content);
  const botRightGroupNodePosition = getBotRightPosition(content);
  const width = botRightGroupNodePosition.x - groupNodePosition.x;
  const height = botRightGroupNodePosition.y - groupNodePosition.y;

  const groupNode: Node<any> = {
    id: groupId,
    position: groupNodePosition,
    draggable: true,
    selectable: false,
    hidden,
    type: "group",
    style: {
      zIndex: -1000,
      backgroundColor: backgroundColorOfShownGroupNode,
      width,
      height,
      border: "none",
    },
    data: {
      color: "#694025",
    },
  };

  return groupNode
};

export type NodeType = Node<ApiNode>;

export type EdgeType = Edge<ApiEdge>;

export enum NodeToolbarType {
  SELECTION_TOOLBAR,
  GROUP_TOOLBAR,
  SINGLE_NODE_TOOLBAR,
};

type ReactFlowContext = ReactFlowInstance<NodeType, EdgeType>;

type OpenEdgeContextMenuHandler = (edge: EdgeType, x: number, y: number) => void;

type OpenCanvasContextMenuHandler = (sourceNodeIdentifier: string, canvasPosition: Position, menuContent: CanvasMenuContentType) => void;

/**
 * We use context to access to callbacks to diagram content, like nodes and edges.
 */
interface DiagramContextType {

  callbacks: () => DiagramCallbacks;

  onOpenEdgeContextMenu: OpenEdgeContextMenuHandler;

  onOpenCanvasContextMenu: OpenCanvasContextMenuHandler;

  /**
   * Stored in context because the idea is to allow max one opened canvas toolbar
   */
  openedCanvasMenu: CanvasMenuContentType | null;

  /**
   * Close any opened canvas toolbar (menu), if none was open, then doesn't do anything.
   */
  closeCanvasMenu(): void;

  getNodeWithToolbar: () => string | null;

  getShownNodeToolbarType: () => NodeToolbarType;

  getAreOnlyEdgesSelected: () => boolean;
}

export const DiagramContext = createContext<DiagramContextType | null>(null);

interface UseDiagramControllerType {

  /**
   * Nodes to render using reactflow.
   */
  nodes: NodeType[];

  /**
   * Edges to render using reactflow.
   */
  edges: EdgeType[];

  /**
   * Context to provide for the diagram components.
   */
  context: DiagramContextType;

  /**
   * Model for edge context menu.
   * Can be null when there is nothing to render.
   * Even when null the toolbar is rendered only when
   * the edge is selected.
   */
  edgeToolbar: EdgeToolbarProps | null;

  canvasMenu: GeneralCanvasMenuComponentProps | null;

  onNodesChange: OnNodesChange<NodeType>;

  onEdgesChange: OnEdgesChange<EdgeType>;

  onConnect: OnConnect;

  onConnectStart: OnConnectStart;

  onConnectEnd: OnConnectEnd;

  onDragOver: React.DragEventHandler;

  onDrop: React.DragEventHandler;

  isValidConnection: IsValidConnection<EdgeType>;

  onNodeDrag: (event: React.MouseEvent, node: Node, nodes: Node[]) => void;

  onNodeDragStart: (event: React.MouseEvent, node: Node, nodes: Node[]) => void;

  onNodeDragStop: (event: React.MouseEvent, node: Node, nodes: Node[]) => void;

  onPaneClick: (event: React.MouseEvent) => void;

  alignmentController: AlignmentController;

  onNodeMouseEnter: (event: React.MouseEvent, node: Node) => void;

  onNodeMouseLeave: (event: React.MouseEvent, node: Node) => void;

  onNodeDoubleClick: (event: React.MouseEvent, node: Node) => void;

}

type NodeIdentifierWithType = {
  identifier: string,
  isGroup: boolean,
}

function useCreateReactStates() {
  const [nodes, setNodes] = useNodesState<NodeType>([]);
  const [edges, setEdges] = useEdgesState<EdgeType>([]);
  const [edgeToolbar, setEdgeToolbar] = useState<EdgeToolbarProps | null>(null);
  const [canvasMenu, setCanvasMenu] = useState<GeneralCanvasMenuComponentProps | null>(null);

  /*
   * Says if the node is selected - having the reactflow property is not enough,
   * because with groups we have to separate between selection by user and in
   * program when group was selected.
   * If we used only the reactflow selection then we can not tell, when to unselect
   * all the nodes in group, because we are not getting the events of user selection
   * on nodes which were selected in program, because they are part of group.
   * So therefore the selected property on reactflow nodes is only the user-selected one
   */
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);

  const [groups, setGroups] = useState<Record<string, NodeIdentifierWithType[]>>({});
  const [nodeToGroupMapping, setNodeToGroupMapping] = useState<Record<string, string>>({});
  // We have to do this because of special case - unfortunately when user immediately starts dragging node in group
  // (that is - he doesn't perform 2 actions - click the button and then click again to drag, he just drags it)
  // Then there is no way for us to make reactflow drag it together - we can set selected = true and dragging = true, but it still has to be dragged manually in program,
  // because it is ignored.
  // This means, that when we are handling the dragging in the onNodeDrag and onNodeDragStop events, then we have to also process the nodes stored here
  // Currently we are not doing any kind of such processing, so it is heads-up for future.
  // Alternatively we could use the ReactFlow groups (https://reactflow.dev/learn/layouting/sub-flows), but I feel like it complicates everything
  // We would suddenly have new type of node with different properties, which we have to take care of everywhere else in the code,
  // we are suddenly starting to work with relative position against the parent group
  // (currently we can assume that absolute coordinate === relative, but with the introduciton of groups we can't make such assumption), etc.
  // And even if we implemented it, there is no guarantee that we won't end up using some dirty tricks anyways.
  // Actually it is almost certain - because if we want to the behavior that dragging occurs only when we start dragging actual node in group
  // and not clicking anywhere in the group - then I see only solution and that it is disable dragging on the group node and set its zIndex to value smaller than normal node
  // But then we are almost exactly where we are now - we have to manually move the nodes when user moves 1 node in group (well probably we could somehow
  // transform the move events in such a way that we will transform it to 1 group event (basically we would delete the existing move events and just transform it
  // to one group move event) ... so it is actually not worth it)
  // Aside from that there would be issues with the group being actual node - that is it could possibly:
  // eat up events, have wrong z-index, process events even when it should not (when we click, hover with mouse to the empty space of group), ...

  // Well what we could maybe do is to have the reactflow group node and have him disabled and only enable him when we click on node in group
  // or actually don't enable at all, it would be just a visual element nothing else - it would be just used for styling - that is the selection box
  // around the group - the box and maybe highlighting is all it would be useful for - but we could probably do that using Viewportal and draw straight on canvas instead of this
  const nodesInGroupWhichAreNotPartOfDragging = useRef<string[]>([]);
  const selectedNodesRef = useRef<string[]>([]);

  // These are user selected nodes - that means the groups selected automatically in program are not contained
  const [userSelectedNodes, setUserSelectedNodes] = useState<string[]>([]);
  const userSelectedNodesRef = useRef<string[]>([]);

  const cleanSelection = useCallback(() => {
    setSelectedNodes([]);
    selectedNodesRef.current = [];
    nodesInGroupWhichAreNotPartOfDragging.current = [];
    setUserSelectedNodes([]);
    userSelectedNodesRef.current = [];
    setNodes(previousNodes => {
      return previousNodes.map(node => {
        if (node.type === "group") {
          return hideGroupNode(node);
        }
        return {...node, selected: false};
      });
    });
    setSelectedEdges([]);
    setEdges(prevEdges => prevEdges.map(edge => ({...edge, selected: false})));
  }, [setSelectedNodes, selectedNodesRef, nodesInGroupWhichAreNotPartOfDragging, setUserSelectedNodes, userSelectedNodesRef, setNodes, setSelectedEdges]);

  return {
    nodes, setNodes,
    edges, setEdges,
    edgeToolbar, setEdgeToolbar,
    canvasMenu, setCanvasMenu,
    selectedNodes, setSelectedNodes, selectedNodesRef,
    selectedEdges, setSelectedEdges,
    groups, setGroups,
    nodeToGroupMapping, setNodeToGroupMapping,
    nodesInGroupWhichAreNotPartOfDragging,
    userSelectedNodes, setUserSelectedNodes, userSelectedNodesRef,
    cleanSelection,
  };
}

function useCreateDiagramControllerIndependentOnActionsAndContext(
  api: UseDiagramType,
  reactFlowInstance: ReactFlowInstance<NodeType, EdgeType>,
  createdReactStates: ReturnType<typeof useCreateReactStates>,
) {
  const {
    nodes, setNodes, setEdges, setEdgeToolbar, setCanvasMenu,
    selectedNodes, setSelectedNodes, setSelectedEdges, selectedEdges,
    groups, nodeToGroupMapping,
    nodesInGroupWhichAreNotPartOfDragging,
    selectedNodesRef,
    userSelectedNodes, setUserSelectedNodes, userSelectedNodesRef,
    cleanSelection,
  } = createdReactStates;
  const alignmentController = useAlignmentController({ reactFlowInstance });
  const canvasHighlighting = useExplorationCanvasHighlightingController(setNodes, setEdges);
  const isCtrlPressed = useKeyPress("Control");

  // The initialized is set to false when new node is added and back to true once the size is determined.
  // const reactFlowInitialized = useNodesInitialized();

  const onChangeSelection = useCallback(createChangeSelectionHandler(
    setSelectedNodes, setSelectedEdges),
  [setSelectedNodes, setSelectedEdges]);

  useOnSelectionChange({ onChange: (onChangeSelection) });

  const onNodesChange = useCallback(createNodesChangeHandler(
    nodes, setNodes, alignmentController, setSelectedNodes, groups, nodeToGroupMapping,
    nodesInGroupWhichAreNotPartOfDragging, selectedNodesRef,
    isCtrlPressed, setUserSelectedNodes, userSelectedNodesRef, selectedNodes, api),
  [nodes, setNodes, alignmentController, setSelectedNodes, groups, nodeToGroupMapping,
    nodesInGroupWhichAreNotPartOfDragging, selectedNodesRef,
    isCtrlPressed, setUserSelectedNodes, userSelectedNodesRef, selectedNodes, api]);

  const onEdgesChange = useCallback(createEdgesChangeHandler(
    setEdges, setSelectedEdges),
  [setEdges, setSelectedEdges]);

  useEffect(() => {
    if(!canvasHighlighting.isHighlightingOn) {
      setHighlightingStylesBasedOnSelection(reactFlowInstance, selectedNodes, selectedEdges, setNodes, setEdges);
    }
  }, [reactFlowInstance, setNodes, setEdges, selectedNodes, selectedEdges, canvasHighlighting.isHighlightingOn]);

  const onConnect = useCallback(createConnectHandler(), [setEdges]);

  const onConnectStart = useCallback(createConnectStartHandler(), []);

  const onConnectEnd = useCallback(createConnectEndHandler(reactFlowInstance, api), [reactFlowInstance, api]);

  const isValidConnection = useCallback(createIsValidConnection(), []);

  const onDragOver = useCallback(createDragOverHandler(), []);

  const onDrop = useCallback(createDropHandler(reactFlowInstance), [reactFlowInstance.screenToFlowPosition]);

  const onOpenCanvasMenu = useCallback(createOpenCanvasMenuHandler(setCanvasMenu), [setCanvasMenu]);

  const onOpenEdgeToolbar = useCallback(createOpenEdgeToolbarHandler(setEdgeToolbar), [setEdgeToolbar]);

  const onNodeDrag = useCallback(createOnNodeDragHandler(), []);
  const onNodeDragStop = useCallback(createOnNodeDragStopHandler(
    api, alignmentController, canvasHighlighting.enableTemporarily, cleanSelection),
  [api, alignmentController, canvasHighlighting.enableTemporarily, cleanSelection]);

  const onNodeMouseEnter = useCallback(createOnNodeMouseEnterHandler(canvasHighlighting.changeHighlight, reactFlowInstance), [canvasHighlighting.changeHighlight, reactFlowInstance]);
  const onNodeMouseLeave = useCallback(createOnNodeMouseLeaveHandler(canvasHighlighting.resetHighlight), [canvasHighlighting.resetHighlight]);

  return {
    alignmentController,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onConnectStart,
    onConnectEnd,
    isValidConnection,
    onDragOver,
    onDrop,
    onOpenCanvasMenu,
    onOpenEdgeToolbar,
    onNodeDrag,
    onNodeDragStop,
    onNodeMouseEnter,
    onNodeMouseLeave,
  };
}

function useCreateDiagramControllerDependentOnActionsAndContext(
  api: UseDiagramType,
  reactFlowInstance: ReactFlowInstance<NodeType, EdgeType>,
  createdReactStates: ReturnType<typeof useCreateReactStates>,
  createdPartOfDiagramController: ReturnType<typeof useCreateDiagramControllerIndependentOnActionsAndContext>,
) {
  const {
    setNodes, setEdges,
    canvasMenu, setCanvasMenu,
    selectedNodes, selectedEdges,
    setSelectedNodes, setSelectedEdges,
    setGroups,
    setNodeToGroupMapping,
    userSelectedNodes,
    cleanSelection,
  } = createdReactStates;
  const { onOpenEdgeToolbar, onOpenCanvasMenu, alignmentController } = createdPartOfDiagramController;

  const context = useMemo(() => createDiagramContext(
    api, onOpenEdgeToolbar, onOpenCanvasMenu, canvasMenu?.menuContent ?? null, setCanvasMenu, selectedNodes, selectedEdges, userSelectedNodes),
  [api, onOpenEdgeToolbar, onOpenCanvasMenu, canvasMenu, setCanvasMenu, selectedNodes, selectedEdges, userSelectedNodes]
  );

  const canvasHighlighting = useExplorationCanvasHighlightingController(setNodes, setEdges);
  const actions = useMemo(() => createActions(reactFlowInstance, setNodes, setEdges, alignmentController, context,
    selectedNodes, setSelectedNodes, setSelectedEdges, canvasHighlighting.changeHighlight, setGroups, setNodeToGroupMapping, cleanSelection),
  [reactFlowInstance, setNodes, setEdges, alignmentController, context,
    selectedNodes, setSelectedNodes, setSelectedEdges,
    canvasHighlighting.changeHighlight, setGroups, setNodeToGroupMapping, cleanSelection]);

  // Register actions to API.
  useEffect(() => api.setActions(actions), [api, actions]);

  const onPaneClick = useCallback(createOnPaneClickHandler(
    context.closeCanvasMenu, cleanSelection),
  [context.closeCanvasMenu, cleanSelection]);

  const onNodeDoubleClick = useCallback(createOnNodeDoubleClickHandler(reactFlowInstance, actions.openGroupMenu), [reactFlowInstance, actions.openGroupMenu]);

  const onNodeDragStart = useCallback(createOnNodeDragStartHandler(
    alignmentController, canvasHighlighting.disableTemporarily, context.closeCanvasMenu),
  [alignmentController, canvasHighlighting.disableTemporarily, context.closeCanvasMenu]);

  return {
    context,
    actions,
    onPaneClick,
    onNodeDoubleClick,
    onNodeDragStart
  };
}

export function useDiagramController(api: UseDiagramType): UseDiagramControllerType {
  const reactStates = useCreateReactStates();
  // We can use useStore get low level access.

  // TODO: Actually it would be better if we grouped the controller parts as in the reactflow reference - https://reactflow.dev/api-reference/react-flow
  const reactFlowInstance = useReactFlow<NodeType, EdgeType>();
  const independentPartOfDiagramController = useCreateDiagramControllerIndependentOnActionsAndContext(api, reactFlowInstance, reactStates);
  const dependentPartOfDiagramController = useCreateDiagramControllerDependentOnActionsAndContext(api, reactFlowInstance, reactStates, independentPartOfDiagramController);

  return {
    nodes: reactStates.nodes,
    edges: reactStates.edges,
    context: dependentPartOfDiagramController.context,
    edgeToolbar: reactStates.edgeToolbar,
    canvasMenu: reactStates.canvasMenu,
    onNodesChange: independentPartOfDiagramController.onNodesChange,
    onEdgesChange: independentPartOfDiagramController.onEdgesChange,
    onConnect: independentPartOfDiagramController.onConnect,
    onConnectStart: independentPartOfDiagramController.onConnectStart,
    onConnectEnd: independentPartOfDiagramController.onConnectEnd,
    onDragOver: independentPartOfDiagramController.onDragOver,
    onDrop: independentPartOfDiagramController.onDrop,
    isValidConnection: independentPartOfDiagramController.isValidConnection,
    onNodeDrag: independentPartOfDiagramController.onNodeDrag,
    onNodeDragStart: dependentPartOfDiagramController.onNodeDragStart,
    onNodeDragStop: independentPartOfDiagramController.onNodeDragStop,
    onPaneClick: dependentPartOfDiagramController.onPaneClick,
    alignmentController: independentPartOfDiagramController.alignmentController,
    onNodeMouseEnter: independentPartOfDiagramController.onNodeMouseEnter,
    onNodeMouseLeave: independentPartOfDiagramController.onNodeMouseLeave,
    onNodeDoubleClick: dependentPartOfDiagramController.onNodeDoubleClick,
  };
}

const createOnNodeDragHandler = () => {
  return (_: React.MouseEvent, _node: Node, _nodes: Node[]) => {
    // TODO RadStr: Debug
    // console.info("OnNodeDrag node", node);
    // console.info("OnNodeDrag nodes", nodes);
  };
};

const createOnNodeDragStartHandler = (
  alignmentController: AlignmentController,
  disableExplorationModeHighlightingChanges: () => void,
  closeCanvasMenu: () => void,
) => {
  return (_: React.MouseEvent, node: Node, _nodes: Node[]) => {
    closeCanvasMenu();
    disableExplorationModeHighlightingChanges();
    alignmentController.alignmentSetUpOnNodeDragStart(node);
  };
};

const createOnNodeMouseEnterHandler = (
  changeHighlight: (
    startingNodeId: string,
    reactFlowInstance: ReactFlowInstance<NodeType, EdgeType>,
    isSourceOfEventCanvas: boolean,
    modelOfClassWhichStartedHighlighting: string | null
  ) => void,
  reactFlowInstance: ReactFlowInstance<NodeType, EdgeType>,
) => {
  return (_: React.MouseEvent, node: Node) => {
    changeHighlight(node.id, reactFlowInstance, true, null);
  };
};

const createOnNodeMouseLeaveHandler = (resetHighlight: () => void) => {
  return (_: React.MouseEvent, _node: Node) => {
    resetHighlight();
  };
};

const createOnNodeDoubleClickHandler = (
  reactflowInstance: ReactFlowInstance<NodeType, EdgeType>,
  openGroupMenu: (groupIdentifier: string, canvasPosition: Position) => void,
) => {
  return (mouseEvent: React.MouseEvent, node: Node) => {
    if(node.type === "group") {
      const position = reactflowInstance.screenToFlowPosition({
        x: mouseEvent.clientX,
        y: mouseEvent.clientY,
      });
      openGroupMenu(node.id, position);
    }
  };
};

const createOnNodeDragStopHandler = (
  api: UseDiagramType,
  alignmentController: AlignmentController,
  enableExplorationModeHighlightingChanges: () => void,
  cleanSelection: () => void,
) => {
  return (_event: React.MouseEvent, node: Node, _nodes: Node[]) => {
    enableExplorationModeHighlightingChanges();
    alignmentController.alignmentCleanUpOnNodeDragStop(node);
    cleanSelection();
  };
};

const createChangeSelectionHandler = (
  _setSelectedNodes: (newNodeSelection: string[]) => void,
  _setSelectedEdges: (newEdgeSelection: string[]) => void,
) => {
  return ({nodes, edges}: OnSelectionChangeParams) => {
    // We can react on change events here.

    // Originally the idea was to call setEdgeToolbar(null),
    // to hide the toolbar when there is change in the selection.
    // But the issue is that since we use only one menu, we show the menu,
    // before the selection change happen.
    // As a result the toolbar was open and closed, causing a blink.
    // The solution of choice was to draw an inspiration from NodeToolbar
    // and watch for edge selection in EdgeToolbar.
  }
};

const createNodesChangeHandler = (
  nodes: NodeType[],
  setNodes: ReactPrevSetStateType<NodeType[]>,
  alignmentController: AlignmentController,
  setSelectedNodes: ReactPrevSetStateType<string[]>,
  groups: Record<string, NodeIdentifierWithType[]>,
  nodeToGroupMapping: Record<string, string>,
  nodesInGroupWhichAreNotPartOfDragging: React.MutableRefObject<string[]>,
  selectedNodesRef: React.MutableRefObject<string[]>,
  isSelectingThroughCtrl: boolean,
  setUserSelectedNodes: ReactPrevSetStateType<string[]>,
  userSelectedNodesRef: React.MutableRefObject<string[]>,
  selectedNodes: string[],
  api: UseDiagramType,
) => {
  return (changes: NodeChange<NodeType>[]) => {
    // We can alter the change here ... for example allow only x-movement.
    // changes.forEach(change => {
    //   if (change.type === "position") {
    //     const positionChange = change as NodePositionChange;
    //     const node = reactFlow.getNode(change.id);
    //     positionChange.position.y = node?.position.y;
    //   }
    // });

    if(handleStartOfGroupDraggingThroughGroupNode(nodes, changes, userSelectedNodesRef, setNodes,
        setUserSelectedNodes, setSelectedNodes, groups, nodesInGroupWhichAreNotPartOfDragging)) {
      return;
    }
    if(handleGroupDraggingThroughNotSelectedNode(changes, userSelectedNodesRef, isSelectingThroughCtrl, setNodes,
        setUserSelectedNodes, setSelectedNodes, groups, nodesInGroupWhichAreNotPartOfDragging, selectedNodes, selectedNodesRef)) {
      return;
    }
    const extractedDataFromChanges = extractDataFromChanges(changes, groups, nodeToGroupMapping, selectedNodesRef, nodes);

    updateChangesByGroupDragEvents(changes, nodes, groups, nodeToGroupMapping, nodesInGroupWhichAreNotPartOfDragging);

    const tmpResult = removeNotCompleteGroupUnselections(
      extractedDataFromChanges.nodeSelectChanges,
      extractedDataFromChanges.unselectChanges,
      nodeToGroupMapping,
      groups,
      extractedDataFromChanges.newlyUnselectedNodesBasedOnGroups,
      isSelectingThroughCtrl,
      userSelectedNodesRef,
    );
    changes = [...new Set(changes)];
    const nodesWhichWereActuallyNotUnselected = tmpResult.nodesWhichWereActuallyNotUnselected;
    extractedDataFromChanges.newlyUnselectedNodesBasedOnGroups = tmpResult.newlyUnselectedNodesBasedOnGroups;

    setUserSelectedNodes(previouslyUserSelectedNodes => {
      const newUserSelectedNodes = updateUserSelectedNodesBasedOnNodeChanges(
        previouslyUserSelectedNodes,
        extractedDataFromChanges.newlyUnselectedNodesBasedOnGroups,
        extractedDataFromChanges.nodeSelectChanges,
        extractedDataFromChanges.unselectChanges,
        userSelectedNodesRef,
        groups,
      );
      return newUserSelectedNodes;
    });

    setSelectedNodes(previouslySelectedNodes => {
      const newSelectedNodes = updateSelectedNodesBasedOnNodeChanges(
        previouslySelectedNodes,
        extractedDataFromChanges.newlyUnselectedNodesBasedOnGroups,
        extractedDataFromChanges.nodeSelectChanges,
        extractedDataFromChanges.unselectChanges,
        nodesWhichWereActuallyNotUnselected,
        extractedDataFromChanges.newlySelectedNodesBasedOnGroups,
        selectedNodesRef,
        userSelectedNodesRef,
        nodesInGroupWhichAreNotPartOfDragging,
      );
      return newSelectedNodes;
    });

    alignmentController.alignmentNodesChange(changes);
    setNodes((prevNodes) => {
      const updatedNodes = updateNodesBasedOnNodeChanges(
        prevNodes,
        changes,
        extractedDataFromChanges.newlyUnselectedNodesBasedOnGroups,
        nodeToGroupMapping,
        extractedDataFromChanges.groupsNewlyContainedInSelectionChange,
        groups,
      );
      return updatedNodes;
    });

    // Because we are dragging nodes which are in groups and are not actually part of selection
    // we can not use onDragStopHandler, but have to perform the update of visual model here.
    if(extractedDataFromChanges.stoppedDragging) {
      // At the end of the node drag we report changes in the positions.
      const visualModelChanges: Record<string, Position> = {};
      for (const change of changes) {
        if(change.type !== "position") {
          continue;
        }
        const node = nodes.find(node => node.id === change.id);
        if(node === undefined || node.type === "group" || change.position === undefined) {
          continue;
        }
        visualModelChanges[change.id] = change.position;
      }
      api.callbacks().onChangeNodesPositions(visualModelChanges);
    }
  }
};

/**
 * Solves the situation when we are starting to drag the "pink" group node
 * @returns True if such situation occured, false if not
 */
const handleStartOfGroupDraggingThroughGroupNode = (
  nodes: NodeType[],
  changes: NodeChange<NodeType>[],
  userSelectedNodesRef: React.MutableRefObject<string[]>,
  setNodes: ReactPrevSetStateType<NodeType[]>,
  setUserSelectedNodes: ReactPrevSetStateType<string[]>,
  setSelectedNodes: ReactPrevSetStateType<string[]>,
  groups: Record<string, NodeIdentifierWithType[]>,
  nodesInGroupWhichAreNotPartOfDragging: React.MutableRefObject<string[]>,
): boolean => {
  const groupCount = Object.entries(groups).length;
  if(groupCount > 0 && nodes.length === changes.length) {
    const notSelectionChanges = changes.filter(change => change.type !== "select" || change.selected);
    if(notSelectionChanges.length === 0) {
      setNodes(prevNodes => applyNodeChanges(changes, prevNodes));
      setSelectedNodes(prevSelectedNodes => {
        nodesInGroupWhichAreNotPartOfDragging.current = [...prevSelectedNodes];
        return prevSelectedNodes;
      });
      setUserSelectedNodes(_ => {
        userSelectedNodesRef.current = [];
        return [];
      });

      return true;
    }
  }

  return false;
};

/**
 * Solves the situation when we are starting to drag selected node which isn't selected in reactflow, but is selected because it is part of group
 * @returns True if there is dragging by not selected node as source. False otherwise
 */
const handleGroupDraggingThroughNotSelectedNode = (
  changes: NodeChange<NodeType>[],
  userSelectedNodesRef: React.MutableRefObject<string[]>,
  isSelectingThroughCtrl: boolean,
  setNodes: ReactPrevSetStateType<NodeType[]>,
  setUserSelectedNodes: ReactPrevSetStateType<string[]>,
  setSelectedNodes: ReactPrevSetStateType<string[]>,
  groups: Record<string, NodeIdentifierWithType[]>,
  nodesInGroupWhichAreNotPartOfDragging: React.MutableRefObject<string[]>,
  selectedNodes: string[],
  selectedNodesRef: React.MutableRefObject<string[]>,
): boolean => {
  if(!isSelectingThroughCtrl && changes.length === userSelectedNodesRef.current.length + 1 && userSelectedNodesRef.current.length > 0) {
    let isPossibleSelectionKeeper: boolean = true;
    let newlySelected: NodeSelectionChange | null = null;
    for(const change of changes) {
      if(change.type !== "select") {
        isPossibleSelectionKeeper = false;
        break;
      }

      if(change.selected) {
        if(newlySelected !== null) {
          isPossibleSelectionKeeper = false;
          break;
        }

        newlySelected = change;
      }
    }

    if(newlySelected !== null && isPossibleSelectionKeeper) {
      const isDraggingThroughGroup = isGroup(newlySelected.id, groups);
      if(selectedNodes.includes(newlySelected.id) || isDraggingThroughGroup) {
        if(isDraggingThroughGroup) {
          setNodes(prevNodes => applyNodeChanges(changes, prevNodes));
          setUserSelectedNodes(_ => []);
          setSelectedNodes(prevSelectedNodes => {
            let newSelectedNodes: string[];
            if(prevSelectedNodes.includes(newlySelected.id)) {
              newSelectedNodes = [...prevSelectedNodes];
              nodesInGroupWhichAreNotPartOfDragging.current = [...prevSelectedNodes];
            }
            else {
              newSelectedNodes = prevSelectedNodes.concat([newlySelected.id]);
              nodesInGroupWhichAreNotPartOfDragging.current = [...newSelectedNodes];
            }

            selectedNodesRef.current = newSelectedNodes;
            userSelectedNodesRef.current = [];
            return newSelectedNodes
          });
        }
        else {
          setNodes(prevNodes => applyNodeChanges(changes, prevNodes));
          setUserSelectedNodes(_ => [newlySelected.id]);
          setSelectedNodes(prevSelectedNodes => {
            let newSelectedNodes: string[];
            if(prevSelectedNodes.includes(newlySelected.id)) {
              newSelectedNodes = [...prevSelectedNodes];
              nodesInGroupWhichAreNotPartOfDragging.current = prevSelectedNodes.filter(selectedNode => selectedNode !== newlySelected.id);
            }
            else {
              newSelectedNodes = prevSelectedNodes.concat([newlySelected.id]);
              nodesInGroupWhichAreNotPartOfDragging.current = [...prevSelectedNodes];
            }
            userSelectedNodesRef.current = [newlySelected.id];
            selectedNodesRef.current = newSelectedNodes;
            return newSelectedNodes
          });
        }

        return true;
      }
    }
  }

  return false;
}

const flattenGroupStructure = (
  identifiersToFlatten: string[],
  groups: Record<string, NodeIdentifierWithType[]>,
): string[] => {
  const onlyNodes: string[] = [];
  identifiersToFlatten.forEach(identifier => {
    if(isGroup(identifier, groups)) {
      onlyNodes.push(...flattenGroupStructure(groups[identifier].map(groupContent => groupContent.identifier), groups));
    }
    else {
      onlyNodes.push(identifier);
    }
  })
  return onlyNodes;
};

const removeNotCompleteGroupUnselections = (
  nodeSelectChanges: string[],
  unselectChanges: string[],
  nodeToGroupMapping: Record<string, string>,
  groups: Record<string, NodeIdentifierWithType[]>,
  newlyUnselectedNodesBasedOnGroups: string[],
  isSelectingThroughCtrl: boolean,
  userSelectedNodesRef: React.MutableRefObject<string[]>,
) => {
  const nodesWhichWereActuallyNotUnselected: string[] = [];
  if(!isSelectingThroughCtrl) {
    const groupToUnselectedCountMap: Record<string, number> = {};
    const groupToUnselectedMap: Record<string, string[]> = {};
    for(const newlyUnselectedNode of unselectChanges) {
      const topLevelGroup = findTopLevelGroup(newlyUnselectedNode, groups, nodeToGroupMapping);
      if(topLevelGroup === null) {
        continue;
      }
      if(groupToUnselectedMap[topLevelGroup] === undefined) {
        groupToUnselectedMap[topLevelGroup] = [];
      }
      groupToUnselectedMap[topLevelGroup].push(newlyUnselectedNode);

      if(groupToUnselectedCountMap[topLevelGroup] === undefined) {
        groupToUnselectedCountMap[topLevelGroup] = 0;
      }
      groupToUnselectedCountMap[topLevelGroup]++;
    }
    for(const newlySelectedNode of nodeSelectChanges) {
      const topLevelGroup = findTopLevelGroup(newlySelectedNode, groups, nodeToGroupMapping);

      if(topLevelGroup === null) {
        continue;
      }
      if(groupToUnselectedCountMap[topLevelGroup] === undefined) {
        continue;
      }
      groupToUnselectedCountMap[topLevelGroup]--;
    }

    Object.entries(groupToUnselectedCountMap).forEach(([groupIdentifier, unselectedNodesCount]) => {
      const groupIdentifiers = groups[groupIdentifier].map(content => content.identifier);
      const flattenedGroup = flattenGroupStructure(groupIdentifiers, groups);
      let userSelectedNodesInGroupCountBefore = 0;
      // Using previouslyUserSelectedNodes is necessary, using passed in userSelectedNodes from caller is not enough -
      // it is behind and we will get incorrect data if we drag for longer time
      for(const previouslyUserSelectedNode of userSelectedNodesRef.current) {
        if(flattenedGroup.includes(previouslyUserSelectedNode)) {
          userSelectedNodesInGroupCountBefore++;
        }
      }

      if(userSelectedNodesInGroupCountBefore > unselectedNodesCount) {
        newlyUnselectedNodesBasedOnGroups = newlyUnselectedNodesBasedOnGroups.filter(unselected => !flattenedGroup.includes(unselected));
        nodesWhichWereActuallyNotUnselected.push(...Object.values(groupToUnselectedMap[groupIdentifier]));
      }
    });
  }

  return {
    nodesWhichWereActuallyNotUnselected,
    newlyUnselectedNodesBasedOnGroups,
  };
}

const extractDataFromChanges = (
  changes: NodeChange<NodeType>[],
  groups: Record<string, NodeIdentifierWithType[]>,
  nodeToGroupMapping: Record<string, string>,
  selectedNodesRef: React.MutableRefObject<string[]>,
  nodes: NodeType[],
) => {
  const newlySelectedNodesBasedOnGroups: string[] = [];
  let newlyUnselectedNodesBasedOnGroups: string[] = [];
  const groupsNewlyContainedInSelectionChange: Record<string, true> = {};
  const unselectChanges: string[] = [];
  const nodeSelectChanges: string[] = [];
  let stoppedDragging = false;
  const debug: NodeIdentifierWithType[] = [];
  // If we are dragging the actual node representing group -
  // we have to do this, because the first select event is not present on that node
  let directlyDraggedGroup: string | null = null;
  let shouldUnselectEverything: boolean = false;
  for (const change of changes) {
    let isSelected: boolean | null = null;
    let changeId: string = "";
    if(change.type === "select") {
      isSelected = change.selected;
      changeId = change.id;
    }
    else if(change.type === "position") {
      if(change.dragging !== true) {
        isSelected = false;
        changeId = change.id;
        shouldUnselectEverything = true;
        if(change.dragging === false) {
          stoppedDragging = true;
        }
      }
      else if(isGroup(change.id, groups)) {
        isSelected = true;
        changeId = change.id;
        directlyDraggedGroup = changeId;
      }
    }
    else if(change.type === "remove") {
      isSelected = false;
      changeId = change.id;
    }
    else if(change.type === "replace") {
      isSelected = false;
      changeId = change.id;
    }

    if(isSelected !== null) {
      if(isSelected) {
        nodeSelectChanges.push(changeId);
      }
      else {
        unselectChanges.push(changeId);
      }

      const groupIdentifier = findTopLevelGroup(changeId, groups, nodeToGroupMapping);
      if(groupIdentifier !== null) {
        if(groupsNewlyContainedInSelectionChange[groupIdentifier] === true) {
          continue;
        }

        const flattenedGroup = flattenGroupStructure([groupIdentifier], groups);
        if(isSelected) {
          debug.push(...groups[groupIdentifier]);
          for (const nodeInGroup of flattenedGroup) {
            if(nodeInGroup !== changeId && !selectedNodesRef.current.includes(nodeInGroup)) {
              newlySelectedNodesBasedOnGroups.push(nodeInGroup);
              groupsNewlyContainedInSelectionChange[groupIdentifier] = true;
            }
          }
        }
        else {
          for (const nodeInGroup of flattenedGroup) {
            if(nodeInGroup !== changeId && selectedNodesRef.current.includes(nodeInGroup)) {
              newlyUnselectedNodesBasedOnGroups.push(nodeInGroup);
              groupsNewlyContainedInSelectionChange[groupIdentifier] = true;
            }
          }
        }
      }

    }
  }
  if(shouldUnselectEverything) {
    for(const selectedNode of selectedNodesRef.current) {
      newlyUnselectedNodesBasedOnGroups.push(selectedNode);
      for(const node of nodes) {
        if(node.selected === true && isGroup(node.id, groups)) {
          changes.push({
            id: node.id,
            type: "select",
            selected: false,
          });
        }
      }
    }
    newlyUnselectedNodesBasedOnGroups = [... new Set(newlyUnselectedNodesBasedOnGroups)];
  }

  return {
    newlySelectedNodesBasedOnGroups,
    newlyUnselectedNodesBasedOnGroups,
    groupsNewlyContainedInSelectionChange,
    unselectChanges,
    nodeSelectChanges: nodeSelectChanges.filter(selectChange => groups[selectChange] === undefined),
    shouldUnselectEverything,
    stoppedDragging,
  };
};

const isGroup = (identifier: string, groups: Record<string, NodeIdentifierWithType[]>) => {
  return groups[identifier] !== undefined;
};

const updateChangesByGroupDragEvents = (
  changes: NodeChange<NodeType>[],
  nodes: NodeType[],
  groups: Record<string, NodeIdentifierWithType[]>,
  nodeToGroupMapping: Record<string, string>,
  nodesInGroupWhichAreNotPartOfDragging: React.MutableRefObject<string[]>,
) => {
  const draggedGroups = [...new Set(changes.filter(change => change.type === "position").map(change => findTopLevelGroup(change.id, groups, nodeToGroupMapping))
    .concat(nodesInGroupWhichAreNotPartOfDragging.current.map(node => findTopLevelGroup(node, groups, nodeToGroupMapping))).filter(group => group !== null))];
  if(draggedGroups.length > 0) {
    for (const change of changes) {
      if(change.type === "position") {
        if(change.position === undefined) {
          continue;
        }

        const positionDifference = {
          x: change.position.x,
          y: change.position.y,
        };
        const sourceNode = nodes.find(node => node.id === change.id);
        positionDifference.x -= sourceNode?.position?.x ?? 0;
        positionDifference.y -= sourceNode?.position?.y ?? 0;

        for(const node of nodes) {
          if(!(nodesInGroupWhichAreNotPartOfDragging.current.includes(node.id) ||
              (isGroup(node.id, groups) && draggedGroups.includes(node.id)))) {
            continue;
          }

          const newPosition = {
            x: node.position.x + positionDifference.x,
            y: node.position.y + positionDifference.y,
          };
          changes.push({
            id: node.id,
            type: "position",
            position: newPosition,
            dragging: change.dragging,
          });
        }
      }

      break;
    }
  }
};

const updateUserSelectedNodesBasedOnNodeChanges = (
  previouslyUserSelectedNodes: string[],
  newlyUnselectedNodesBasedOnGroups: string[],
  nodeSelectChanges: string[],
  unselectChanges: string[],
  userSelectedNodesRef: React.MutableRefObject<string[]>,
  groups: Record<string, NodeIdentifierWithType[]>,
) => {
  if(nodeSelectChanges.length === 0 && unselectChanges.length === 0) {
    return previouslyUserSelectedNodes;
  }
  let newUserSelectedNodes = previouslyUserSelectedNodes
    .filter(previouslySelectedNode => !unselectChanges.includes(previouslySelectedNode))
    .filter(previouslySelectedNode => !newlyUnselectedNodesBasedOnGroups.includes(previouslySelectedNode))
    // TODO RadStr: Should be unnecessary
    .filter(previouslySelectedNode => !isGroup(previouslySelectedNode, groups));

  newUserSelectedNodes.push(...nodeSelectChanges);
  newUserSelectedNodes = [... new Set(newUserSelectedNodes)];

  userSelectedNodesRef.current = newUserSelectedNodes;

  return newUserSelectedNodes;
};

const updateSelectedNodesBasedOnNodeChanges = (
  previouslySelectedNodes: string[],
  newlyUnselectedNodesBasedOnGroups: string[],
  nodeSelectChanges: string[],
  unselectChanges: string[],
  nodesWhichWereActuallyNotUnselected: string[],
  newlySelectedNodesBasedOnGroups: string[],
  selectedNodesRef: React.MutableRefObject<string[]>,
  userSelectedNodesRef: React.MutableRefObject<string[]>,
  nodesInGroupWhichAreNotPartOfDragging: React.MutableRefObject<string[]>,
) => {
  if(nodeSelectChanges.length === 0 && unselectChanges.length === 0) {
    return previouslySelectedNodes;
  }
  let newSelectedNodes = previouslySelectedNodes.filter(newSelectedNode => !newlyUnselectedNodesBasedOnGroups.includes(newSelectedNode));
  const relevantUnselectChanges = unselectChanges.filter(unselectChange => !nodesWhichWereActuallyNotUnselected.includes(unselectChange));
  newSelectedNodes = newSelectedNodes.filter(newSelectedNode => !relevantUnselectChanges.includes(newSelectedNode));
  newSelectedNodes.push(...nodeSelectChanges);
  newSelectedNodes.push(...newlySelectedNodesBasedOnGroups);
  newSelectedNodes = [... new Set(newSelectedNodes)];

  selectedNodesRef.current = newSelectedNodes;
  nodesInGroupWhichAreNotPartOfDragging.current = newSelectedNodes.filter(newSelectedNode => !userSelectedNodesRef.current.includes(newSelectedNode));

  return newSelectedNodes;
};

const updateNodesBasedOnNodeChanges = (
  prevNodes: NodeType[],
  changes: NodeChange<NodeType>[],
  newlyUnselectedNodesBasedOnGroups: string[],
  nodeToGroupMapping: Record<string, string>,
  groupsNewlyContainedInSelectionChange: Record<string, true>,
  groups: Record<string, NodeIdentifierWithType[]>,
) => {
  const updatedNodes = applyNodeChanges(changes, prevNodes);
  if(Object.entries(groupsNewlyContainedInSelectionChange).length > 0) {
    for(const group of Object.keys(groupsNewlyContainedInSelectionChange)) {
      const groupNodeIndex = updatedNodes.findIndex(node => node.id === group);
      if(groupNodeIndex === -1) {
        continue;
      }
      updatedNodes[groupNodeIndex] = showGroupNode(updatedNodes[groupNodeIndex], groups, updatedNodes);
    }
  }

  for(const newlyUnselectedNode of newlyUnselectedNodesBasedOnGroups) {
    const processedGroups: Record<string, true> = {};
    const group = findTopLevelGroup(newlyUnselectedNode, groups, nodeToGroupMapping);
    if(group === null) {
      continue;
    }
    if(processedGroups[group] === undefined) {
      processedGroups[group] = true;
      const groupNodeIndex = updatedNodes.findIndex(node => node.id === group);
      if(groupNodeIndex === -1) {
        continue;
      }
      if(updatedNodes[groupNodeIndex].hidden !== true) {
        updatedNodes[groupNodeIndex] = hideGroupNode(updatedNodes[groupNodeIndex]);
      }
    }
  }

  return updatedNodes;
};

const createEdgesChangeHandler = (
  setEdges: ReactPrevSetStateType<EdgeType[]>,
  setSelectedEdges: ReactPrevSetStateType<string[]>,
) => {
  return (changes: EdgeChange<EdgeType>[]) => {
    setEdges((prevEdges) => {
      const edgesAfterChanges = applyEdgeChanges(changes, prevEdges);
      const newlyRemoved: string[] = changes.filter(change => change.type === "remove").map(change => change.id);
      setSelectedBasedOnNewData(setSelectedEdges, edgesAfterChanges, null, newlyRemoved);
      return edgesAfterChanges;
    });
  };
};

const setSelectedBasedOnNewData = (
  setSelected: ReactPrevSetStateType<string[]>,
  newData: NodeType[] | EdgeType[],
  selectedNodesRef: React.MutableRefObject<string[]> | null,
  newlyRemoved: string[],
) => {
  setSelected(previouslySelected => {
    const newlySelected: string[] = [];
    const newlyUnselected: string[] = [...newlyRemoved];
    for(const element of newData) {
      const isElementPreviouslySelected = previouslySelected.includes(element.id);
      if(element.selected === true && !isElementPreviouslySelected) {
        newlySelected.push(element.id);
      }
      else if(element.selected !== true && isElementPreviouslySelected) {
        newlyUnselected.push(element.id);
      }
    }

    if(newlySelected.length === 0 && newlyUnselected.length === 0) {
      return previouslySelected;
    }
    const result = previouslySelected.filter(previouslySelectedElement => !newlyUnselected.includes(previouslySelectedElement));
    result.push(...newlySelected);

    if(selectedNodesRef !== null) {
      selectedNodesRef.current = result;
    }

    return result;
  });
}

const createConnectHandler = () => {
  return (_: Connection) => {
    // Here we would normally handle creation of a new edge in reaction
    // to DiagramFlow editor action.
    // Instead we handle the action in createConnectEndHandler method.
    // Therefore, there is nothing happening here.
  };
};

const createConnectStartHandler = (): OnConnectStart => {
  return () => {
    // Should there be a need we can react to on start connection event.
    // At one point we use this to store reference to the connection source,
    // yet as we can get it in createConnectEndHandler, there is no need to do it anymore.
  };
};

const createConnectEndHandler = (
  reactFlow: ReactFlowInstance<NodeType, EdgeType>,
  api: UseDiagramType
): OnConnectEnd => {
  // This handler is called when user finish dragging a new connection.
  // We need to handle this action using the API, notifying the owner about an event.
  // There are two possible events:
  // 1) User dragged the connection to a node.
  // 2) User dragged the connection to an empty space.
  return (event: MouseEvent | TouchEvent, connection: FinalConnectionState) => {
    const source = connection.fromNode as NodeType | null;
    const positionRelativeToViewport = connection.to;
    if (source === null || positionRelativeToViewport === null) {
      // We have no source or position of the target.
      return;
    }
    const targetIsPane = (event.target as Element).classList.contains("react-flow__pane");
    const flowPosition = reactFlow.screenToFlowPosition({x: (event as unknown as React.MouseEvent)?.clientX, y: (event as unknown as React.MouseEvent)?.clientY});
    if (targetIsPane) {
      api.callbacks().onCreateConnectionToNothing(source.data, flowPosition);
    } else {
      if (connection.toNode === null) {
        // If user have not attached the node to the handle, we get no target.
        const nodes = reactFlow.getIntersectingNodes({ x: positionRelativeToViewport.x, y: positionRelativeToViewport.y, width: 1, height: 1 });
        if (nodes.length === 0) {
          api.callbacks().onCreateConnectionToNothing(source.data, flowPosition);
        } else {
          // There is something under it.
          api.callbacks().onCreateConnectionToNode(source.data, nodes[0].data);
        }
      } else {
        api.callbacks().onCreateConnectionToNode(source.data, connection.toNode.data as any);
      }
    }
  };
};

const createIsValidConnection = (): IsValidConnection<EdgeType> => {
  return (_: EdgeType | Connection) => {
    // We can return false to prevent addition of an edge to a given handle.
    // Yet as we have no handle types here, we can always return true.
    return true;
  };
};

const createDragOverHandler = (): React.DragEventHandler => {
  return (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    console.log("useDiagramController.createDragOverHandler");
  };
};

const createDropHandler = (reactFlow: ReactFlowInstance<NodeType, EdgeType>): React.DragEventHandler => {
  return (event: React.DragEvent) => {
    event.preventDefault();
    const position = reactFlow.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    console.log("useDiagramController.onDrop", { position });
  };
};

const createOpenEdgeToolbarHandler = (setEdgeToolbar: (edgeToolbarProps: EdgeToolbarProps | null) => void): OpenEdgeContextMenuHandler => {
  return (edge: EdgeType, x: number, y: number) => {
    const edgeType = edge.data?.type;
    if (edgeType !== undefined) {
      setEdgeToolbar({ edgeIdentifier: edge.id, x, y, edgeType });
    } else {
      console.error("Ignore open menu request for edge without data.", { edge });
    }
  };
};

const createOpenCanvasMenuHandler = (
  setCanvasMenu: (menuProps: GeneralCanvasMenuComponentProps | null) => void
): OpenCanvasContextMenuHandler => {
  return (sourceNodeIdentifier: string, canvasPosition: Position, menuContent: CanvasMenuContentType) => {
    const newCanvasMenu: GeneralCanvasMenuComponentProps = {
      menuProps: {
        canvasPosition,
        sourceNodeIdentifier,
      },
      menuContent,
    };

    setCanvasMenu(newCanvasMenu);
  };
};

type OnPaneClickHandler = (event: React.MouseEvent) => void;

const createOnPaneClickHandler = (
  closeCanvasMenu: () => void,
  cleanSelection: () => void,
): OnPaneClickHandler => {
  return (_: React.MouseEvent) => {
    closeCanvasMenu();
    cleanSelection();       // This isn't needed, it is just as safety measure if there is some bug in selection code
  };
};

const createGroups = (
  previousGroups: Record<string, NodeIdentifierWithType[]>,
  groupsToAdd: GroupWithContent[]
) => {
  const newGroups = {...previousGroups};
  groupsToAdd.forEach(({group, content}) => {
    const contentWithType = content.map(element => ({
      identifier: element,
      isGroup: isGroup(element, previousGroups),
    }));

    newGroups[group.identifier] = contentWithType;
  });
  return newGroups;
};

const createNodeToGroupMapping = (
  previousMapping: Record<string, string>,
  groupsToAdd: GroupWithContent[]
) => {
  const newNodeToGroupMapping = {...previousMapping};
  groupsToAdd.forEach(({group, content}) => {
    content.forEach(identifier => {
      newNodeToGroupMapping[identifier] = newNodeToGroupMapping[identifier] ?? group.identifier;
    });
  });
  return newNodeToGroupMapping;
};

/**
 * Creates implementation of action that could be called from the owner.
 */
const createActions = (
  reactFlow: ReactFlowInstance<NodeType, EdgeType>,
  setNodes: React.Dispatch<React.SetStateAction<NodeType[]>>,
  setEdges: React.Dispatch<React.SetStateAction<EdgeType[]>>,
  alignment: AlignmentController,
  context: DiagramContextType,
  selectedNodes: string[],
  setSelectedNodesInternal: React.Dispatch<React.SetStateAction<string[]>>,
  setSelectedEdgesInternal: React.Dispatch<React.SetStateAction<string[]>>,
  changeHighlight: (
    startingNodeId: string,
    reactFlowInstance: ReactFlowInstance<NodeType, EdgeType>, isSourceOfEventCanvas: boolean, modelOfClassWhichStartedHighlighting: string | null
  ) => void,
  setGroups: ReactPrevSetStateType<Record<string, NodeIdentifierWithType[]>>,
  setNodeToGroupMapping: ReactPrevSetStateType<Record<string, string>>,
  cleanSelection: () => void,
): DiagramActions => {
  return {
    getGroups() {
      console.log("Diagram.getGroups");
      return [];
    },
    addGroups(groups, hideAddedTopLevelGroups) {
      console.log("Diagram.addGroup", { groups });

      setGroups(prevGroups => {
        return createGroups(prevGroups, groups);
      });

      setNodeToGroupMapping(prevMapping => {
        return createNodeToGroupMapping(prevMapping, groups);
      });

      setNodes(prevNodes => {
        const newGroupNodes: Node<any>[] = [];
        let newNodes = [...prevNodes];
        const nodeToGroupMapping = createNodeToGroupMapping({}, groups);
        // We have to collect the group nodes separately, so we can refer to them later in method if we created more than 1
        groups.forEach(({group, content}) => {
          const isTopLevelGroup = nodeToGroupMapping[group.identifier] === undefined;
          const groupNode = createGroupNode(group.identifier, prevNodes.filter(node => content.includes(node.id)), isTopLevelGroup ? hideAddedTopLevelGroups : true);
          newGroupNodes.push(groupNode);
        });
        newNodes = newGroupNodes.concat(newNodes);

        groups.forEach(({group, content}) => {
          for(const nodeInGroupIdentifier of content) {
            const nodeInGroupIndex = newNodes.findIndex(node => node.id === nodeInGroupIdentifier);
            if(nodeInGroupIndex === -1) {
              console.error("Could not find node which is part of group in the list of diagram nodes", {newNodes, group, content, nodeInGroupIdentifier});
              continue;
            }

            if(newNodes[nodeInGroupIndex].type === "group") {
              newNodes[nodeInGroupIndex] = hideGroupNode(newNodes[nodeInGroupIndex]);
            }
            else {
              newNodes[nodeInGroupIndex].data.group = newNodes[nodeInGroupIndex].data.group ?? group.identifier
            }
          }
        });
        return newNodes;
      });
    },
    removeGroups(groups) {
      console.log("Diagram.removeGroups", { groups });

      setGroups(prevGroups => {
        const newGroups = {...prevGroups};
        for(const group of groups) {
          delete newGroups[group];
        }
        return newGroups;
      });

      setNodeToGroupMapping(prevMapping => {
        const newNodeToGroupMapping = {...prevMapping};
        // Remove the references to the groups of nodes lying inside it
        Object.keys(newNodeToGroupMapping).forEach(nodeIdentifier => {
          if(groups.includes(newNodeToGroupMapping[nodeIdentifier])) {
            delete newNodeToGroupMapping[nodeIdentifier];
          }
        });
        return newNodeToGroupMapping;
      });

      setNodes(prevNodes => {
        return prevNodes.map(node => {
          if(groups.includes(node.id)) {
            return null;
          }
          if(node.type === "group") {
            return node;
          }
          if(node.data.group !== null && groups.includes(node.data.group)) {
            return {
              ...node,
              selected: false,
              data: {
                ...node.data,
                group: null,
              },
            };
          }

          return node;
        }).filter(node => node !== null);
      });

      cleanSelection();
    },
    setGroup(group, content) {
      console.log("Diagram.setGroup", { group, content });

      // TODO RadStr: Check tommorrow - but I think that it can be implemented through the createGroups
      setGroups(prevGroups => {
        const contentWithType = content.map(element => ({
          identifier: element,
          isGroup: isGroup(element, prevGroups),
        }));
        return {...prevGroups, [group.identifier]: contentWithType};
      });

      setNodeToGroupMapping(prevMapping => {
        const newNodeToGroupMapping = {...prevMapping};
        Object.keys(prevMapping).forEach(key => {
          if(prevMapping[key] === group.identifier && !content.includes(key)) {
            delete newNodeToGroupMapping[key];
          }
        })
        content.forEach(identifier => {
          newNodeToGroupMapping[identifier] = group.identifier;
        });
        return newNodeToGroupMapping;
      });

      setNodes(prevNodes => {
        const newGroupNode = createGroupNode(group.identifier, prevNodes.filter(node => content.includes(node.id)), true);
        return prevNodes.map(node => {
          if(node.id === group.identifier) {
            return newGroupNode;
          }
          if(node.type === "group") {
            return hideGroupNode(node);
          }
          if(content.includes(node.id)) {
            return {
              ...node,
              selected: false,
              data: {
                ...node.data,
                group: node.data.group ?? group.identifier,
              },
            };
          }
          else if(node.data.group === group.identifier && !content.includes(node.id)) {
            return {
              ...node,
              selected: false,
              data: {
                ...node.data,
                group: null,
              }
            }
          }
          else {
            return {
              ...node,
              selected: false,
            };
          }
        });
      });

      cleanSelection();
    },
    getGroupContent(group) {
      console.log("Diagram.getGroupContent", { group });
      return [];
    },
    //
    getNodes() {
      console.log("Diagram.getNodes");
      return reactFlow.getNodes().map(node => node.data);
    },
    addNodes(nodes) {
      reactFlow.addNodes(nodes.map(nodeToNodeType));
      console.log("Diagram.addNodes", nodes.map(item => item.identifier), nodes);
    },
    updateNodes(nodes) {
      console.log("Diagram.updateNodes", nodes.map(item => item.identifier), nodes);

      const changed: Record<string, NodeType> = {};
      nodes.forEach(node => changed[node.identifier] = nodeToNodeType(node));
      reactFlow.setNodes((prev) => prev.map(node => {
        // TODO RadStr: We are not using the groups anyways, so idk
        if(changed[node.data.identifier] !== undefined) {
          if(changed[node.data.identifier].data.group === null) {
            changed[node.data.identifier].data.group = node.data.group;
          }
          return changed[node.data.identifier];
        }
        return node;
      }));
    },
    updateNodesPosition(nodes) {
      console.log("Diagram.updateNodesPosition", nodes);
    },
    removeNodes(identifiers) {
      reactFlow.deleteElements({ nodes: identifiers.map(id => ({ id })) });
      console.log("Diagram.removeNodes", identifiers);
    },
    getNodeWidth(identifier) {
      const width = reactFlow.getNode(identifier)?.measured?.width ?? null;
      return width;
    },
    getNodeHeight(identifier) {
      const height = reactFlow.getNode(identifier)?.measured?.height ?? null;
      return height;
    },
    //
    getEdges() {
      console.log("Diagram.getEdges");
      return [];
    },
    addEdges(edges) {
      reactFlow.addEdges(edges.map(edgeToEdgeType));
      console.log("Diagram.addEdges", edges.map(item => item.identifier), edges);
    },
    updateEdges(edges) {
      console.log("Diagram.updateEdges", edges.map(item => item.identifier), edges);

      const changed: Record<string, EdgeType> = {};
      edges.forEach(edge => changed[edge.identifier] = edgeToEdgeType(edge));
      reactFlow.setEdges((prev) => prev.map(edge => {
        // We need to use asterisk here as data may be undefined.
        // Not sure why this is not the case for updateNodes.
        return changed[edge.data!.identifier] ?? edge;
      }));
    },
    setEdgesWaypointPosition(edges) {
      console.log("Diagram.setEdgesWaypointPosition", edges);
    },
    removeEdges(identifiers) {
      reactFlow.deleteElements({ edges: identifiers.map(id => ({ id })) });
      console.log("Diagram.removeEdges", identifiers);
    },
    //
    getSelectedNodes() {
      console.log("Diagram.getSelectedNodes");
      return reactFlow.getNodes().filter(node => selectedNodes.includes(node.id)).map(node => node.data);
    },
    setSelectedNodes(nodes) {
      console.log("Diagram.setSelectedNodes", nodes);
      reactFlow.setNodes(prevNodes => {
        return prevNodes.map(node => {
          if(nodes.find(selectedNode => selectedNode === node.id) !== undefined) {
            return {...node, selected: true};
          }
          return {...node, selected: false};
        });
      });
      setSelectedNodesInternal(nodes);
    },
    getSelectedEdges() {
      console.log("Diagram.getSelectedEdges");
      // Have to filter afterwards, because in reactflow the edges' data are optional
      return reactFlow.getEdges().filter(edge => edge.selected === true).map(edge => edge.data).filter(edge => edge !== undefined);
    },
    setSelectedEdges(edges) {
      console.log("Diagram.setSelectedEdges", edges);
      reactFlow.setEdges(prevEdges => {
        return prevEdges.map(edge => {
          if(edges.find(selectedEdge => selectedEdge === edge.id) !== undefined) {
            return {...edge, selected: true};
          }
          return {...edge, selected: false};
        });
      });

      setSelectedEdgesInternal(edges);
    },
    //
    async setContent(nodes, edges, groups) {
      console.log("Diagram.setContent", { nodes, edges });
      setNodes(nodes.map(nodeToNodeType));
      setEdges(edges.map(edgeToEdgeType));
      this.addGroups(groups, true);
      cleanSelection();
      alignment.onReset();
      return Promise.resolve();
    },
    //
    getViewport() {
      const viewport = reactFlow.getViewport();
      // I have zero idea why is it switched, but it is
      const position = { x: -viewport.x, y: -viewport.y };
      const flow__viewport = document.querySelector(".react-flow__viewport") as HTMLElement | null;
      const viewportDimensionsToReturn = {
        position,
        width: (flow__viewport?.clientWidth ?? 0),
        height: (flow__viewport?.clientHeight ?? 0)
      };
      convertViewUsingZoom(viewportDimensionsToReturn, viewport.zoom);
      return viewportDimensionsToReturn;
    },
    setViewportToPosition(x, y) {
      console.log("Diagram.setViewToPosition", { x, y });
    },
    centerViewportToNode(identifier) {
      console.log("Diagram.focusNode", { identifier });
      const node = reactFlow.getNode(identifier);
      if (node !== undefined) {
        focusNodeAction(reactFlow, node);
      }
    },
    fitToView(identifiers) {
      const nodes = identifiers.map(identifier => reactFlow.getNode(identifier)).filter(node => node !== undefined);
      if (nodes.length > 0) {
        focusNodesAction(reactFlow, nodes);
      }
    },
    renderToSvgString() {
      return diagramContentAsSvg(reactFlow.getNodes());
    },
    openDragEdgeToCanvasMenu(sourceNode, canvasPosition) {
      console.log("openDragEdgeToCanvasToolbar", {sourceNode, canvasPosition});
      context?.onOpenCanvasContextMenu(sourceNode.identifier, canvasPosition, CanvasMenuCreatedByEdgeDrag);
    },
    openSelectionActionsMenu(sourceNode, canvasPosition) {
      console.log("openSelectionActionsMenu", {sourceNode, canvasPosition});
      context?.onOpenCanvasContextMenu(sourceNode.identifier, canvasPosition, SelectionActionsMenu);
    },
    openGroupMenu(groupIdentifier, canvasPosition) {
      console.log("openGroupMenu", {groupIdentifier, canvasPosition});
      context?.onOpenCanvasContextMenu(groupIdentifier, canvasPosition, GroupMenu);
    },
    highlightNodeInExplorationModeFromCatalog(nodeIdentifier, modelOfClassWhichStartedHighlighting) {
      changeHighlight(nodeIdentifier, reactFlow, false, modelOfClassWhichStartedHighlighting);
    },
  };
};

const convertViewUsingZoom = (view: ViewportDimensions, zoom: number): void => {
  const zoomReciprocal = 1 / zoom;
  view.position.x *= zoomReciprocal;
  view.position.y *= zoomReciprocal;
  view.width *= zoomReciprocal;
  view.height *= zoomReciprocal;
};

const nodeToNodeType = (node: ApiNode): NodeType => {
  return {
    id: node.identifier,
    type: EntityNodeName,
    position: {
      x: node.position.x,
      y: node.position.y,
    },
    data: node,
  };
};

const edgeToEdgeType = (edge: ApiEdge): EdgeType => {
  return {
    id: edge.identifier,
    source: edge.source,
    target: edge.target,
    type: selectEdgeType(edge),
    label: edge.label,
    // We need to assign the marker here as the value is transformed.
    // In addition reactflow use this value.
    markerEnd: selectMarkerEnd(edge, null),
    style: {
      strokeWidth: 2,
      stroke: edge.color,
    },
    data: {
      ...edge,
      waypoints: [...edge.waypoints],
    },
  };
};

function selectEdgeType(edge: ApiEdge) {
  switch (edge.type) {
  case ApiEdgeType.Association:
  case ApiEdgeType.AssociationProfile:
    return PropertyEdgeName;
  case ApiEdgeType.Generalization:
    return GeneralizationEdgeName;
  case ApiEdgeType.ClassProfile:
    return ClassProfileEdgeName;
  }
}

/**
 * @param color If null is given then the original edge color is used
 */
export function selectMarkerEnd(edge: ApiEdge, color: string | null) {
  switch (edge.type) {
  case ApiEdgeType.Association:
    return { type: MarkerType.Arrow, height: 20, width: 20, color: color ?? edge.color };
  case ApiEdgeType.AssociationProfile:
    return { type: MarkerType.Arrow, height: 20, width: 20, color: color ?? edge.color };
  case ApiEdgeType.Generalization:
    return { type: MarkerType.ArrowClosed, height: 20, width: 20, color: color ?? edge.color };
  case ApiEdgeType.ClassProfile:
    return { type: MarkerType.ArrowClosed, height: 20, width: 20, color: color ?? edge.color };
  }
}

/**
 * Move view to given node with animation.
 * https://reactflow.dev/examples/misc/use-react-flow-hook
 */
const focusNodeAction = (reactFlow: ReactFlowContext, node: Node) => {
  const x = node.position.x + (node.measured?.width ?? 0) / 2;
  const y = node.position.y + (node.measured?.height ?? 0) / 2;
  const zoom = 1.85;
  // TODO We can return the promise to allow caller to react on it.
  void reactFlow.setCenter(x, y, { zoom, duration: 1000 });
};

// Should be superset of the focusNodeAction
const focusNodesAction = (reactFlow: ReactFlowContext, nodes: Node[]) => {
  reactFlow.fitView({nodes: nodes,
    duration: 1000,
    minZoom: 0.125
  });
};

const computeShownNodeToolbarType = (
  userSelectedNodes: string[],
  selectedEdges: string[],
) => {
  if(userSelectedNodes.length > 1 || (userSelectedNodes.length === 1 && selectedEdges.length > 0)) {
    return NodeToolbarType.SELECTION_TOOLBAR;
  }
  else {
    return NodeToolbarType.SINGLE_NODE_TOOLBAR;
  }
};

const createDiagramContext = (
  api: UseDiagramType,
  onOpenEdgeContextMenu: OpenEdgeContextMenuHandler,
  onOpenCanvasContextMenu: OpenCanvasContextMenuHandler,
  openedCanvasMenu: CanvasMenuContentType | null,
  setCanvasMenu: (_: null) => void,
  selectedNodes: string[],
  selectedEdges: string[],
  userSelectedNodes: string[],
): DiagramContextType => {
  const shownNodeToolbarType = computeShownNodeToolbarType(userSelectedNodes, selectedEdges);
  const closeCanvasMenu = () => setCanvasMenu(null);
  const getAreOnlyEdgesSelected = () => {
    return selectedNodes.length === 0 && selectedEdges.length !== 0;
  };

  return {
    callbacks: api.callbacks,
    onOpenEdgeContextMenu,
    onOpenCanvasContextMenu,
    openedCanvasMenu,
    closeCanvasMenu,
    getNodeWithToolbar: () => userSelectedNodes.at(-1) ?? null,
    getShownNodeToolbarType: () => shownNodeToolbarType,

    getAreOnlyEdgesSelected,
  };
};
