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
  NodeAddChange,
  NodeSelectionChange,
  NodePositionChange,
  XYPosition,
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
} from "./diagram-api";
import { type EdgeToolbarProps } from "./edge/edge-toolbar";
import { EntityNodeName } from "./node/entity-node";
import { PropertyEdgeName } from "./edge/property-edge";

import { type AlignmentController, useAlignmentController } from "./features/alignment-controller-v2";
import { GeneralizationEdgeName } from "./edge/generalization-edge";
import { ClassProfileEdgeName } from "./edge/class-profile-edge";
import { diagramContentAsSvg } from "./render-svg";
import { CanvasToolbarGeneralProps, CanvasToolbarContentType } from "./canvas/canvas-toolbar-props";
import { CanvasToolbarCreatedByEdgeDrag } from "./canvas/canvas-toolbar-drag-edge";
import { NodeSelectionActionsSecondaryToolbar } from "./node/node-secondary-toolbar";
import { setHighlightingStylesBasedOnSelection } from "./features/highlighting/set-selection-highlighting-styles";
import { useExplorationCanvasHighlightingController } from "./features/highlighting/exploration/canvas/canvas-exploration-highlighting-controller";
import { ReactPrevSetStateType } from "./utilities";


// TODO RadStr: DEBUG TESTING
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

// TODO RadStr: Probably could be class-names instead
const backgroundColorOfHiddenGroupNode = "rgba(255, 0, 0, 0)";
const backgroundColorOfShownGroupNode = "rgba(255, 0, 255, 0.04)";

function hideGroupNode(groupNode: Node<any>) {
  return changeGroupNodeVisibility(groupNode, false);
}

function showGroupNode(groupNode: Node<any>) {
  return changeGroupNodeVisibility(groupNode, true);
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

  const groupNode: Node<any>
  = {
      id: groupId,
      position: groupNodePosition,
      // className: 'light',
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
          // borderStyle: "none",

//                     background: '#fff',
//   border: '1px solid black',
//   borderRadius: 15,
//   fontSize: 12,

// background: "#fff",
//   fontSize: 12,
//   border: "1px solid black",
//   padding: 5,
//   borderRadius: 15,
//   height: 100,
      },
      // type: "resizableNode",
      // type: "classCustomNode",
      // type: EntityNodeName,
      data: {
          cls: undefined,
          color: "#694025",
          attributes: [],
          attributeUsages: [],
      },
      // expandParent: true,
  };

  return groupNode
};

const createGroup = (groupId: string, setNodes: ReactPrevSetStateType<Node<any>[]>) => {
  setNodes(prevNodes => {
    const selectedNodes = prevNodes.map(n => n.selected === true ? n : null).filter(n => n !== null).filter(n => n.parentId === undefined);
    const groupNode: Node<any> = createGroupNode(groupId, prevNodes, false);

    selectedNodes.forEach(node => {
        // With parentId it doesn't work properly with selection, it keeps jumping
        // node.parentId = "grupa";
        node.parentId = groupId;
        // node.parentNode = "mzm5kthiswfly5ujegg";
        node.extent = "parent";
        node.style = {
            ...node.style,
            zIndex: 1,
        };
    });

    // return prevNodes.map(node => {
    //     const replacementNode = selectedNodes.find(n => n.id === node.id);
    //     if(replacementNode !== undefined) {
    //         return {...replacementNode};
    //     }

    //     return node;
    // }).concat([groupNode]);

    // Order matters the groups have to be first
    return [groupNode].concat(prevNodes.map(node => {
        const replacementNode = selectedNodes.find(n => n.id === node.id);
        // if(node.id === "mzm5kthiswfly5ujegg") {
        //     node.style = {
        //         ...node.style,
        //         width: 700,
        //         height: 500,
        //     };
        // }
        if(replacementNode !== undefined) {
            replacementNode.position.x -= groupNode.position.x;
            replacementNode.position.y -= groupNode.position.y;
            return {...replacementNode};
        }

        return node;
    }));

  });

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

type OpenCanvasContextMenuHandler = (sourceClassNode: ApiNode, canvasPosition: Position, toolbarContent: CanvasToolbarContentType) => void;

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
  openedCanvasToolbar: CanvasToolbarContentType | null;

  /**
   * Close any opened canvas toolbar, if none was open, then doesn't do anything.
   */
  closeCanvasToolbar(): void;

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

  canvasToolbar: CanvasToolbarGeneralProps | null;

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


  // TODO RadStr: DEBUG
  onSelectionDrag: (event: React.MouseEvent, nodes: Node[]) => void;
}

function useCreateReactStates() {
  const [nodes, setNodes] = useNodesState<NodeType>([]);
  const [edges, setEdges] = useEdgesState<EdgeType>([]);
  const [edgeToolbar, setEdgeToolbar] = useState<EdgeToolbarProps | null>(null);
  const [canvasToolbar, setCanvasToolbar] = useState<CanvasToolbarGeneralProps | null>(null);

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

  const [groups, setGroups] = useState<Record<string, string[]>>({});
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

  const onChangeEventsDebugRef = useRef<NodeChange[][]>([]);

  return {
    nodes, setNodes,
    edges, setEdges,
    edgeToolbar, setEdgeToolbar,
    canvasToolbar, setCanvasToolbar,
    selectedNodes, setSelectedNodes, selectedNodesRef,
    selectedEdges, setSelectedEdges,
    groups, setGroups,
    nodeToGroupMapping, setNodeToGroupMapping,
    nodesInGroupWhichAreNotPartOfDragging,
    userSelectedNodes, setUserSelectedNodes, userSelectedNodesRef,
    onChangeEventsDebugRef,
  };
}

function useCreateDiagramControllerIndependentOnActionsAndContext(
  api: UseDiagramType,
  reactFlowInstance: ReactFlowInstance<NodeType, EdgeType>,
  createdReactStates: ReturnType<typeof useCreateReactStates>,
) {
  const {
    nodes, setNodes, setEdges, setEdgeToolbar, setCanvasToolbar,
    selectedNodes, setSelectedNodes, setSelectedEdges, selectedEdges,
    groups, nodeToGroupMapping,
    nodesInGroupWhichAreNotPartOfDragging,
    selectedNodesRef,
    userSelectedNodes, setUserSelectedNodes, userSelectedNodesRef,
    onChangeEventsDebugRef,
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
    nodes, setNodes, alignmentController, setSelectedNodes, groups, nodeToGroupMapping, nodesInGroupWhichAreNotPartOfDragging, selectedNodesRef, isCtrlPressed, userSelectedNodes, setUserSelectedNodes, userSelectedNodesRef, onChangeEventsDebugRef, selectedNodes),
    [nodes, setNodes, alignmentController, setSelectedNodes, groups, nodeToGroupMapping, nodesInGroupWhichAreNotPartOfDragging, selectedNodesRef, isCtrlPressed, userSelectedNodes, setUserSelectedNodes, userSelectedNodesRef, onChangeEventsDebugRef, selectedNodes]);

  const onEdgesChange = useCallback(createEdgesChangeHandler(
    setEdges, setSelectedEdges),
    [setEdges, setSelectedEdges]);

  useEffect(() => {
    console.info("RadStr DEBUG: USE EFFECT", [...selectedNodes], [...selectedEdges], selectedNodesRef.current, [...selectedNodesRef.current], [...userSelectedNodes], [...userSelectedNodesRef.current]);
    if(!canvasHighlighting.isHighlightingOn) {
      setHighlightingStylesBasedOnSelection(reactFlowInstance, selectedNodes, selectedEdges, setNodes, setEdges);
    }
  }, [reactFlowInstance, setNodes, setEdges, selectedNodes, selectedEdges, canvasHighlighting.isHighlightingOn, isCtrlPressed]);

  const onConnect = useCallback(createConnectHandler(), [setEdges]);

  const onConnectStart = useCallback(createConnectStartHandler(), []);

  const onConnectEnd = useCallback(createConnectEndHandler(reactFlowInstance, api), [reactFlowInstance, api]);

  const isValidConnection = useCallback(createIsValidConnection(), []);

  const onDragOver = useCallback(createDragOverHandler(), []);

  const onDrop = useCallback(createDropHandler(reactFlowInstance), [reactFlowInstance.screenToFlowPosition]);

  const onOpenCanvasToolbar = useCallback(createOpenCanvasToolbarHandler(setCanvasToolbar), [setCanvasToolbar]);

  const onOpenEdgeToolbar = useCallback(createOpenEdgeToolbarHandler(setEdgeToolbar),
    [setEdgeToolbar]);

  const onNodeDrag = useCallback(createOnNodeDragHandler(), []);
  const onNodeDragStart = useCallback(createOnNodeDragStartHandler(
    alignmentController, canvasHighlighting.disableTemporarily, nodesInGroupWhichAreNotPartOfDragging),
    [alignmentController, canvasHighlighting.disableTemporarily, nodesInGroupWhichAreNotPartOfDragging]);
  const onNodeDragStop = useCallback(createOnNodeDragStopHandler(
    api, alignmentController, canvasHighlighting.enableTemporarily, nodesInGroupWhichAreNotPartOfDragging),
    [api, alignmentController, canvasHighlighting.enableTemporarily, nodesInGroupWhichAreNotPartOfDragging]);

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
    onOpenCanvasToolbar,
    onOpenEdgeToolbar,
    onNodeDrag,
    onNodeDragStart,
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
    canvasToolbar, setCanvasToolbar,
    selectedNodes, selectedEdges,
    setSelectedNodes, setSelectedEdges,
    groups, setGroups,
    nodeToGroupMapping, setNodeToGroupMapping,
    userSelectedNodes,
  } = createdReactStates;
  const { onOpenEdgeToolbar, onOpenCanvasToolbar, alignmentController } = createdPartOfDiagramController;

  const context = useMemo(() => createDiagramContext(
    api, onOpenEdgeToolbar, onOpenCanvasToolbar, canvasToolbar?.toolbarContent ?? null, setCanvasToolbar, selectedNodes, selectedEdges, groups, nodeToGroupMapping, userSelectedNodes),
    [api, onOpenEdgeToolbar, onOpenCanvasToolbar, canvasToolbar, setCanvasToolbar, selectedNodes, selectedEdges, groups, nodeToGroupMapping, userSelectedNodes]
  );

  const canvasHighlighting = useExplorationCanvasHighlightingController(setNodes, setEdges);
  const actions = useMemo(() => createActions(reactFlowInstance, setNodes, setEdges, alignmentController, context,
    selectedNodes, setSelectedNodes, setSelectedEdges, canvasHighlighting.changeHighlight, setGroups, setNodeToGroupMapping),
    [reactFlowInstance, setNodes, setEdges, alignmentController, context,
      selectedNodes, setSelectedNodes, setSelectedEdges, canvasHighlighting.changeHighlight, setGroups, setNodeToGroupMapping]);

  // Register actions to API.
  useEffect(() => api.setActions(actions), [api, actions]);

  const onPaneClick = useCallback(createOnPaneClickHandler(
    context.closeCanvasToolbar, setSelectedNodes, setSelectedEdges),
    [context.closeCanvasToolbar, setSelectedNodes, setSelectedEdges]);

  return {
    context,
    actions,
    onPaneClick,
  };
}


export function useDiagramController(api: UseDiagramType): UseDiagramControllerType {
  const reactStates = useCreateReactStates();
  // We can use useStore get low level access.
  const reactFlowInstance = useReactFlow<NodeType, EdgeType>();
  const independentPartOfDiagramController = useCreateDiagramControllerIndependentOnActionsAndContext(api, reactFlowInstance, reactStates);
  const dependentPartOfDiagramController = useCreateDiagramControllerDependentOnActionsAndContext(api, reactFlowInstance, reactStates, independentPartOfDiagramController);

  return {
    nodes: reactStates.nodes,
    edges: reactStates.edges,
    context: dependentPartOfDiagramController.context,
    edgeToolbar: reactStates.edgeToolbar,
    canvasToolbar: reactStates.canvasToolbar,
    onNodesChange: independentPartOfDiagramController.onNodesChange,
    onEdgesChange: independentPartOfDiagramController.onEdgesChange,
    onConnect: independentPartOfDiagramController.onConnect,
    onConnectStart: independentPartOfDiagramController.onConnectStart,
    onConnectEnd: independentPartOfDiagramController.onConnectEnd,
    onDragOver: independentPartOfDiagramController.onDragOver,
    onDrop: independentPartOfDiagramController.onDrop,
    isValidConnection: independentPartOfDiagramController.isValidConnection,
    onNodeDrag: independentPartOfDiagramController.onNodeDrag,
    onNodeDragStart: independentPartOfDiagramController.onNodeDragStart,
    onNodeDragStop: independentPartOfDiagramController.onNodeDragStop,
    onPaneClick: dependentPartOfDiagramController.onPaneClick,
    alignmentController: independentPartOfDiagramController.alignmentController,
    onNodeMouseEnter: independentPartOfDiagramController.onNodeMouseEnter,
    onNodeMouseLeave: independentPartOfDiagramController.onNodeMouseLeave,

    // TODO RadStr: Debug
    onSelectionDrag: (event: React.MouseEvent, nodes: Node[]) => console.info("onSelectionDrag", nodes),
  };
}

const createOnNodeDragHandler = () => {
  return (event: React.MouseEvent, node: Node, nodes: Node[]) => {
    // TODO RadStr: Debug
    console.info("OnNodeDrag node", node);
    console.info("OnNodeDrag nodes", nodes);

  };
};

const createOnNodeDragStartHandler = (
  alignmentController: AlignmentController,
  disableExplorationModeHighlightingChanges: () => void,
  selectedNodesRef: React.MutableRefObject<string[]>,
) => {
  return (event: React.MouseEvent, node: Node, nodes: Node[]) => {
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
  return (_: React.MouseEvent, node: Node) => {
    resetHighlight();
  };
};

const createOnNodeDragStopHandler = (
  api: UseDiagramType,
  alignmentController: AlignmentController,
  enableExplorationModeHighlightingChanges: () => void,
  nodesInGroupWhichAreNotPartOfDragging: React.MutableRefObject<string[]>
) => {
  return (event: React.MouseEvent, node: Node, nodes: Node[]) => {
    enableExplorationModeHighlightingChanges();
    alignmentController.alignmentCleanUpOnNodeDragStop(node);
    // At the end of the node drag we report changes in the positions.
    const changes: Record<string, Position> = {};
    for (const node of nodes) {
      changes[node.id] = node.position;
    }
    api.callbacks().onChangeNodesPositions(changes);
    nodesInGroupWhichAreNotPartOfDragging.current = [];   // TODO RadStr: Maybe unnecessary
  };
};

const createChangeSelectionHandler = (
    setSelectedNodes: (newNodeSelection: string[]) => void,
    setSelectedEdges: (newEdgeSelection: string[]) => void,
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

    // TODO RadStr: Or maybe not - this was actually breaking some stuff - TODO: Probably remove

    // // This solves the issue that when user drags single node, the node itself becomes selected but it is not separate selection event in the onNodesChange
    // // So the trick is to just empty the selection if both selections are empty

    // // You might be asking why not just do everything here? Why split into 3 different methods (this, onNodesChange, onEdgesChange).
    // // Well there are many reasons -
    // //     1) This method is called later, which results in flickering of the highlighting and onSelection toolbar menu (it shows for a while the classic menu instead of the selection one)
    // //     2) It isn't one call - If we shift-select node it is actually split into 3 calls - select only nodes, only edges, select both - so we have to solve it specifically
    // //                  - and even worse for ctrl selection it is again different and it seems that sometimes they might be different amount of calls etc.
    // //        So the issue is that there are many ways to change selection and the behavior is different for each
    // // Maybe there exists better solution, but I tried many and this was the first one which seems to work almost always (except for one TODO:) without much hassle

    // // TODO RadStr: Currently there is issue that if user shift selects group of nodes and then moves them and then control select any node, the old selection is highlighted
    // //              This is related to the fact that currently ending the node drag event ends the node selection (because they are changed in visual model and the callback remades the nodes)
    // //              But it is not the same case for edges .... So I feel like it doesn't make sense to try it fix now, since the callbacks might change and this will become non-issue
    // //              ...... Because the actual behavior should be that the nodes are still selected even after dragging, so after fixing it in visual model, this will become non-issue
    // if(nodes.length === 0 && edges.length === 0) {
    //   setSelectedNodes([]);
    //   setSelectedEdges([]);
    // }
  }
};


const isNodeChangeChangingSelection = (change: NodeChange<NodeType>): change is (NodePositionChange | NodeSelectionChange) => {
  return change.type === "select" || (change.type === "position" && change.dragging === false);
};


const createNodesChangeHandler = (
  nodes: NodeType[],
  setNodes: ReactPrevSetStateType<NodeType[]>,
  alignmentController: AlignmentController,
  setSelectedNodes: ReactPrevSetStateType<string[]>,
  groups: Record<string, string[]>,
  nodeToGroupMapping: Record<string, string>,
  nodesInGroupWhichAreNotPartOfDragging: React.MutableRefObject<string[]>,
  selectedNodesRef: React.MutableRefObject<string[]>,
  isSelectingThroughCtrl: boolean,
  userSelectedNodes: string[],
  setUserSelectedNodes: ReactPrevSetStateType<string[]>,
  userSelectedNodesRef: React.MutableRefObject<string[]>,
  onChangeEventsDebugRef: React.MutableRefObject<NodeChange[][]>,
  selectedNodes: string[],
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


    // // Added group to diagram
    // TODO RadStr: Probably remove, I am not even sure what it was about
    // // TODO RadStr: Maybe we should dela with all the dimension changes - I am not sure if it can somehow happen that changes will be stacked
    // //              That is I will add group and it will be grouped with the following/previous changes - but probably not.
    // if(changes.length === 1 && changes[0].type === "dimensions") {
    //   const groupIdentifier = changes[0].id;
    //   if(groups[groupIdentifier] !== undefined) {
    //     setNodes(prevNodes => applyNodeChanges(changes, prevNodes));
    //     return;
    //   }

    //   setNodes(prevNodes => applyNodeChanges(changes, prevNodes));
    //   setSelectedNodes(prevSelectedNodes => [...prevSelectedNodes].concat([groupIdentifier]));
    //   nodesInGroupWhichAreNotPartOfDragging.current.push(groupIdentifier);
    //   return;
    // }


    const extractedDataFromChanges = getDataFromChanges(
      changes,
      groups,
      nodeToGroupMapping,
      onChangeEventsDebugRef,
    );


    // TODO RadStr: Commented code just for now to play with - remove after "final" commit
    // setNodes(prevNodes => {
    //   return prevNodes.map(node => {
    //     if(newlySelectedNodesBasedOnGroups.includes(node.id)) {
    //       return {...node, selected: true};
    //     }
    //     return node;
    //   });
    // });

    // if(newlySelectedNodesBasedOnGroups.length !== 0) {
    //   return
    // }


    // TODO RadStr: Using the selected in data instead ... remove
    // addNewChangesBasedOnGroups(newlySelectedNodesBasedOnGroups, changedSelectionByUser, true, changes);
    // addNewChangesBasedOnGroups(newlyUnselectedNodesBasedOnGroups, changedSelectionByUser, false, changes);



    updateChangesByGroupDragEvents(
      changes,
      nodes,
      groups,
      nodeToGroupMapping,
      extractedDataFromChanges.directlyDraggedGroup,
      nodesInGroupWhichAreNotPartOfDragging,   // TODO RadStr: Probably not needed, we can be fine with draggedGroups
    );

    // setSelectedBasedOnChanges(setSelectedNodes, changes, selectedNodesRef, nodes);

    // if(lastSelectedNode !== null) {
    //   setNodeWithToolbar(lastSelectedNode);
    // }
    // else {
    //   if(selectedNodesRef.current.length === 0) {
    //     setNodeWithToolbar(null);
    //   }
    //   else if (currentNodeWithToolbar !== null && changes.map(change => (change.type === "select" && !change.selected) ? change.id : null).includes(currentNodeWithToolbar)) {
    //     setNodeWithToolbar(selectedNodesRef.current.at(-1) ?? null);
    //   }
    // }
    // console.warn("selectedNodesRef.current.length");
    // console.warn(selectedNodesRef.current.length);
    // console.warn(selectedNodesRef.current);
    // console.warn(nodes);

    // TODO RadStr: Improve API
    const tmpResult = removeNotCompleteGroupUnselections(
      extractedDataFromChanges.selectChanges,
      extractedDataFromChanges.unselectChanges,
      nodeToGroupMapping,
      groups,
      changes,
      extractedDataFromChanges.newlyUnselectedNodesBasedOnGroups,
      isSelectingThroughCtrl,

      extractedDataFromChanges.debug,
      extractedDataFromChanges.changedSelectionByUser,
      extractedDataFromChanges.newlySelectedNodesBasedOnGroups,
      userSelectedNodes,
      nodes,
      extractedDataFromChanges.groupsNewlyContainedInSelectionChange,
      userSelectedNodesRef,
    );
    changes = tmpResult.changes;
    const nodesWhichWereActuallyNotUnselected = tmpResult.nodesWhichWereActuallyNotUnselected;
    extractedDataFromChanges.newlySelectedNodesBasedOnGroups = tmpResult.newlyUnselectedNodesBasedOnGroups

    // TODO RadStr: The explicit variant
    // const newSelectedNodes = updatedNodes.filter(node => node.selected === true).map(node => node.id);
    // setSelectedNodes(p => newSelectedNodes);
    // selectedNodesRef.current = newSelectedNodes;


    // if(lastSelectedNode !== null) {
    //   setNodeWithToolbar(lastSelectedNode);
    // }
    // else {
    //   if(updatedNodes.filter(node => node.selected === true).map(node => node.id).length === 0) {
    //     setNodeWithToolbar(null);
    //   }
    //   else if (currentNodeWithToolbar !== null && changes.map(change => (change.type === "select" && !change.selected) ? change.id : null).includes(currentNodeWithToolbar)) {
    //     setNodeWithToolbar(updatedNodes.filter(node => node.selected === true).map(node => node.id).at(-1) ?? null);
    //   }
    // }
    setUserSelectedNodes(previouslyUserSelectedNodes => {
      const newUserSelectedNodes = updateUserSelectedNodesBasedOnNodeChanges(
        previouslyUserSelectedNodes,
        extractedDataFromChanges.newlyUnselectedNodesBasedOnGroups,
        extractedDataFromChanges.selectChanges,
        extractedDataFromChanges.unselectChanges,
        userSelectedNodesRef
      );
      return newUserSelectedNodes;
    });


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TODO RadStr: Maybe should call when actual change occurs so we don't update, when we don't need to
    // setSelectedBasedOnNewData(setSelectedNodes, updatedNodes, selectedNodesRef, nodes);    
    setSelectedNodes(previouslySelectedNodes => {
      const newSelectedNodes = updateSelectedNodesBasedOnNodeChanges(
        previouslySelectedNodes,
        extractedDataFromChanges.newlyUnselectedNodesBasedOnGroups,
        extractedDataFromChanges.selectChanges,
        extractedDataFromChanges.unselectChanges,
        nodesWhichWereActuallyNotUnselected,
        extractedDataFromChanges.newlySelectedNodesBasedOnGroups,
        selectedNodesRef,
        userSelectedNodesRef,
        nodesInGroupWhichAreNotPartOfDragging,
        nodes,
        changes,
      );
      return newSelectedNodes;
    });
    // const newNodesInGroupWhichAreNotPartOfDragging: string[] = [...nodesInGroupWhichAreNotPartOfDragging.current];  // TODO RadStr: Not optimal - can change only small part instead of everything
    // newNodesInGroupWhichAreNotPartOfDragging.push(...newlySelectedNodesBasedOnGroups);
    // // Also remove duplicates - TODO RadStr: Maybe not necessary
    // nodesInGroupWhichAreNotPartOfDragging.current = [...new Set(newNodesInGroupWhichAreNotPartOfDragging
    //   .filter(newNode => !newUserSelectedNodes.includes(newNode))
    //   .filter(newNode => !newlyUnselectedNodesBasedOnGroups.includes(newNode)))];
    // TODO RadStr: Just the old version
    // const newNodesInGroupWhichAreNotPartOfDragging: string[] = [];
    // for(const updatedNode of updatedNodes) {
    //   if(updatedNode.data.isSelected && !newUserSelectedNodes.includes(updatedNode.id)) {
    //     newNodesInGroupWhichAreNotPartOfDragging.push(updatedNode.id);
    //   }
    // }
    // nodesInGroupWhichAreNotPartOfDragging.current = newNodesInGroupWhichAreNotPartOfDragging;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    alignmentController.alignmentNodesChange(changes);
    ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    setNodes((prevNodes) => {
      const updatedNodes = updateNodesBasedOnNodeChanges(
        prevNodes,
        changes,
        extractedDataFromChanges.selectChanges,
        extractedDataFromChanges.unselectChanges,
        extractedDataFromChanges.newlyUnselectedNodesBasedOnGroups,
        nodeToGroupMapping,
        userSelectedNodes,
        extractedDataFromChanges.groupsNewlyContainedInSelectionChange,
        userSelectedNodesRef,
        onChangeEventsDebugRef
      );
      return updatedNodes;
    });
    ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
  }
};


const removeNotCompleteGroupUnselections = (
  selectChanges: string[],
  unselectChanges: string[],
  nodeToGroupMapping: Record<string, string>,
  groups: Record<string, string[]>,
  changes: NodeChange<NodeType>[],
  newlyUnselectedNodesBasedOnGroups: string[],
  isSelectingThroughCtrl: boolean,

  debug: string[],
  changedSelectionByUser: string[],
  newlySelectedNodesBasedOnGroups: string[],
  userSelectedNodes: string[],
  nodes: NodeType[],
  groupsNewlyContainedInSelectionChange: Record<string, true>,
  userSelectedNodesRef: React.MutableRefObject<string[]>,
) => {
  const nodesWhichWereActuallyNotUnselected: string[] = [];
  if(!isSelectingThroughCtrl) {
    const groupToUnselectedCountMap: Record<string, number> = {};
    const groupToUnselectedMap: Record<string, string[]> = {};
    for(const newlyUnselectedNode of unselectChanges) {
      if(nodeToGroupMapping[newlyUnselectedNode] === undefined) {
        continue;
      }
      if(groupToUnselectedMap[nodeToGroupMapping[newlyUnselectedNode]] === undefined) {
        groupToUnselectedMap[nodeToGroupMapping[newlyUnselectedNode]] = [];
      }
      groupToUnselectedMap[nodeToGroupMapping[newlyUnselectedNode]].push(newlyUnselectedNode);

      if(groupToUnselectedCountMap[nodeToGroupMapping[newlyUnselectedNode]] === undefined) {
        groupToUnselectedCountMap[nodeToGroupMapping[newlyUnselectedNode]] = 0;
      }
      groupToUnselectedCountMap[nodeToGroupMapping[newlyUnselectedNode]]++;
    }
    for(const newlyUnselectedNode of selectChanges) {
      if(nodeToGroupMapping[newlyUnselectedNode] === undefined) {
        continue;
      }
      if(groupToUnselectedCountMap[nodeToGroupMapping[newlyUnselectedNode]] === undefined) {
        continue;
      }
      groupToUnselectedCountMap[nodeToGroupMapping[newlyUnselectedNode]]--;
    }

    console.info("WHEN LOOKING FOR FAILED GROUP UNSELECTION");
    console.info([...unselectChanges]);
    console.info([...selectChanges]);
    console.info([...changedSelectionByUser]);
    console.info([...debug]);
    console.info({...groupToUnselectedCountMap});
    console.info({...nodeToGroupMapping});
    console.info([...newlySelectedNodesBasedOnGroups]);
    console.info([...newlyUnselectedNodesBasedOnGroups]);
    console.info({...groupsNewlyContainedInSelectionChange});
    console.info([...userSelectedNodes]);
    console.info([...userSelectedNodesRef.current]);
    console.info([nodes.filter(n => n.selected === true)]);
    console.info([nodes]);

    Object.entries(groupToUnselectedCountMap).forEach(([groupIdentifier, unselectedNodesCount]) => {
      let userSelectedNodesInGroupCountBefore = 0;
      // Using previouslyUserSelectedNodes is necessary, using passed in userSelectedNodes from caller is not enough -
      // it is behind and we will get incorrect data if we drag for longer time
      for(const previouslyUserSelectedNode of userSelectedNodesRef.current) {
        if(groups[groupIdentifier].includes(previouslyUserSelectedNode)) {
          userSelectedNodesInGroupCountBefore++;
        }
      }

      console.info(`${groups[groupIdentifier].length}--**${userSelectedNodesInGroupCountBefore}--**--${unselectedNodesCount}`);
      if(userSelectedNodesInGroupCountBefore > unselectedNodesCount) {
        changes = changes.filter(change => (!isNodeChangeChangingSelection(change)) || !groups[groupIdentifier].includes(change.id));
        newlyUnselectedNodesBasedOnGroups = newlyUnselectedNodesBasedOnGroups.filter(unselected => !groups[groupIdentifier].includes(unselected));
        nodesWhichWereActuallyNotUnselected.push(...Object.values(groupToUnselectedMap[groupIdentifier]));

        // TODO RadStr: Actually I do that in the changes.filter .... so I dont need the groupToUnselectedMap at all.
        // Add in the unselect actions for the group - because we need to apply them to the nodes
        addNewChangesBasedOnGroups(groupToUnselectedMap[groupIdentifier], [], false, changes);

        console.info("changes after filter", changes);
        console.info("newlyUnselectedNodesBasedOnGroups after filter", newlyUnselectedNodesBasedOnGroups);
      }
      else {
        console.info("ELSE");
      }
    });
  }


  console.info("newlyUnselectedNodesBasedOnGroups");
  console.info(newlyUnselectedNodesBasedOnGroups);
  console.info(newlySelectedNodesBasedOnGroups);

  return {
    nodesWhichWereActuallyNotUnselected,
    changes,
    newlyUnselectedNodesBasedOnGroups,
  };
}


const getDataFromChanges = (
  changes: NodeChange<NodeType>[],
  groups: Record<string, string[]>,
  nodeToGroupMapping: Record<string, string>,
  onChangeEventsDebugRef: React.MutableRefObject<NodeChange[][]>,
) => {
  console.info("changes", {...changes});
  const newlySelectedNodesBasedOnGroups: string[] = [];
  let newlyUnselectedNodesBasedOnGroups: string[] = [];
  const groupsNewlyContainedInSelectionChange: Record<string, true> = {};
  const changedSelectionByUser: string[] = [];      // TODO RadStr: Not using anywhere
  const unselectChanges: string[] = [];
  const selectChanges: string[] = [];
  const debug: string[] = [];
  // If we are dragging the actual node representing group -
  // we have to do this, because the first select event is not present on that node
  let directlyDraggedGroup: string | null = null;
  onChangeEventsDebugRef.current.push([...changes]);
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
      }
      else if(groups[change.id] !== undefined) {
        isSelected = true;
        changeId = change.id;
        directlyDraggedGroup = changeId;
      }
    }
    else if(change.type === "remove") {
      isSelected = false;
      changeId = change.id;
    }

    if(isSelected !== null) {
      if(isSelected) {
        selectChanges.push(changeId);
      }
      else {
        unselectChanges.push(changeId);
      }
      changedSelectionByUser.push(changeId);

      const groupIdentifier = nodeToGroupMapping[changeId] ?? (groups[changeId] === undefined ? undefined : changeId);
      if(groupIdentifier !== undefined) {
        if(groupsNewlyContainedInSelectionChange[groupIdentifier] === true) {
          continue;
        }

        if(isSelected) {
          debug.push(...groups[groupIdentifier]);
          for (const nodeInGroup of groups[groupIdentifier]) {
            // TODO RadStr: Is it necessary? maybe we can deal possible duplications even without checking through ref
            if(nodeInGroup !== changeId) {
            // if(nodeInGroup !== changeId && !selectedNodesRef.current.includes(nodeInGroup)) {
            // if(nodeInGroup !== changeId && !nodes.filter(node => node.selected === true).map(node => node.id).includes(nodeInGroup)) {
              if(nodeInGroup === undefined) {
                console.info("UNDEFINED");
                console.info(changeId);
                console.info(groups);
                console.info(nodeToGroupMapping);
                alert("UNDEFINED");
              }

              newlySelectedNodesBasedOnGroups.push(nodeInGroup);
              groupsNewlyContainedInSelectionChange[groupIdentifier] = true;
            }
          }
        }
        else {
          for (const nodeInGroup of groups[groupIdentifier]) {
            if(nodeInGroup !== changeId) {
            // if(nodeInGroup !== changeId && selectedNodesRef.current.includes(nodeInGroup)) {
            // if(nodeInGroup !== changeId && nodes.filter(node => node.selected === true).map(node => node.id).includes(nodeInGroup)) {
              newlyUnselectedNodesBasedOnGroups.push(nodeInGroup);
              groupsNewlyContainedInSelectionChange[groupIdentifier] = true;
            }
          }
        }
      }
    }
  }

  return {
    newlySelectedNodesBasedOnGroups,
    newlyUnselectedNodesBasedOnGroups,
    groupsNewlyContainedInSelectionChange,
    changedSelectionByUser,   // TODO RadStr: Not using anywhere
    unselectChanges,
    selectChanges,
    debug,
    directlyDraggedGroup,
  };
};


const updateChangesByGroupDragEvents = (
  changes: NodeChange<NodeType>[],
  nodes: NodeType[],
  groups: Record<string, string[]>,
  nodeToGroupMapping: Record<string, string>,
  directlyDraggedGroup: string | null,
  nodesInGroupWhichAreNotPartOfDragging: React.MutableRefObject<string[]>,   // TODO RadStr: Probably not needed, we can be fine with draggedGroups
) => {
  console.info("nodesInGroupWhichAreNotPartOfDragging.current.length");
  console.info(nodesInGroupWhichAreNotPartOfDragging.current.length);
  // TODO RadStr: Probably can put away the nodesInGroupWhichAreNotPartOfDragging.current.length and directlyDraggedGroup !== null condition
  const draggedGroups = [...new Set(changes.filter(change => change.type === "position").map(change => nodeToGroupMapping[change.id])
                          .concat(nodesInGroupWhichAreNotPartOfDragging.current.map(n => nodeToGroupMapping[n])).filter(group => group !== undefined))];
  if(nodesInGroupWhichAreNotPartOfDragging.current.length > 0 || directlyDraggedGroup !== null || draggedGroups.length > 0) {
    for (const change of changes) {
      if(change.type === "position") {
        if(!(directlyDraggedGroup === null || change.id === directlyDraggedGroup)) {
          continue;
        }
        const positionDifference = {
          x: change.position?.x ?? 0,
          y: change.position?.y ?? 0,
        };                // TODO: For now position, but should be absolute probably
        const sourceNode = nodes.find(node => node.id === change.id);   // TODO: Should probably use the prevNodes instead. Therefore I don't even need the nodes
        positionDifference.x -= sourceNode?.position?.x ?? 0;
        positionDifference.y -= sourceNode?.position?.y ?? 0;


        // TODO RadStr: Debug prints
        console.info("positionDifference");
        console.info({...nodes.filter(n => n.selected === true)});
        console.info(positionDifference);
        console.info(sourceNode?.position);
        console.info({...change.position});
        console.warn(nodesInGroupWhichAreNotPartOfDragging.current);
        console.warn({...nodes.filter(n => n.selected === true)});
        console.info(directlyDraggedGroup);


        for(const node of nodes) {
          if(!(nodesInGroupWhichAreNotPartOfDragging.current.includes(node.id) ||
              (directlyDraggedGroup !== null && groups[change.id].includes(node.id)) ||
              (groups[node.id] !== undefined && draggedGroups.includes(node.id)))) {
            console.info("Not dragged", node);
            continue;
          }

          changes.push({
            id: node.id,
            type: "position",
            position: {
              x: node.position.x + (positionDifference.x ?? 0),
              y: node.position.y + (positionDifference.y ?? 0),
            },
            dragging: change.dragging,
          });
        }


        // TODO RadStr: Commented code just for now to play with - remove after "final" commit
        // setNodes(prevNodes => {
        //   return prevNodes.map(node => {
        //     if(node.id === change.id || node.selected !== true) {
        //       return {...node, dragging: true};
        //     }

        //     return {...node, dragging: true, draggable: true, };
        //   });
        // });
      }

      break;
    }
  }

  console.info("Changes after:", changes);
};


const updateUserSelectedNodesBasedOnNodeChanges = (
  previouslyUserSelectedNodes: string[],
  newlyUnselectedNodesBasedOnGroups: string[],
  selectChanges: string[],
  unselectChanges: string[],
  userSelectedNodesRef: React.MutableRefObject<string[]>,
) => {
      // let newUserSelectedNodes = previouslyUserSelectedNodes
      let newUserSelectedNodes = previouslyUserSelectedNodes
        .filter(previouslySelectedNode => !unselectChanges.includes(previouslySelectedNode))
        .filter(previouslySelectedNode => !newlyUnselectedNodesBasedOnGroups.includes(previouslySelectedNode));

      newUserSelectedNodes.push(...selectChanges);
      newUserSelectedNodes = [... new Set(newUserSelectedNodes)];
      // const newUserSelectedNodes = updatedNodes.filter(node => node.selected === true).map(node => node.id);

      userSelectedNodesRef.current = newUserSelectedNodes;
      console.info("newUserSelectedNodes", newUserSelectedNodes);
      return newUserSelectedNodes;
};


const updateSelectedNodesBasedOnNodeChanges = (
  previouslySelectedNodes: string[],
  newlyUnselectedNodesBasedOnGroups: string[],
  selectChanges: string[],
  unselectChanges: string[],
  nodesWhichWereActuallyNotUnselected: string[],
  newlySelectedNodesBasedOnGroups: string[],
  selectedNodesRef: React.MutableRefObject<string[]>,
  userSelectedNodesRef: React.MutableRefObject<string[]>,
  nodesInGroupWhichAreNotPartOfDragging: React.MutableRefObject<string[]>,
  nodes: NodeType[],
  changes: NodeChange<NodeType>[],
) => {
  let newSelectedNodes = [...previouslySelectedNodes];
  newSelectedNodes = newSelectedNodes.filter(newSelectedNode => !newlyUnselectedNodesBasedOnGroups.includes(newSelectedNode));
  const relevantUnselectChanges = unselectChanges.filter(unselectChange => !nodesWhichWereActuallyNotUnselected.includes(unselectChange));
  newSelectedNodes = newSelectedNodes.filter(newSelectedNode => !relevantUnselectChanges.includes(newSelectedNode));
  newSelectedNodes.push(...selectChanges);
  newSelectedNodes.push(...newlySelectedNodesBasedOnGroups);
  newSelectedNodes = [... new Set(newSelectedNodes)];

  selectedNodesRef.current = newSelectedNodes;
  nodesInGroupWhichAreNotPartOfDragging.current = newSelectedNodes.filter(newSelectedNode => !userSelectedNodesRef.current.includes(newSelectedNode));

  // TODO RadStr: DEBUG
  if(newSelectedNodes.length !== applyNodeChanges(changes, nodes).filter(n => n.selected === true).length) {
    console.info("if(newSelectedNodes.length !== applyNodeChanges(changes, nodes).filter(n => n.selected === true).length)");
    console.info(newSelectedNodes.length);
    console.info(applyNodeChanges(changes, nodes).filter(n => n.selected === true).length);
    console.info(applyNodeChanges(changes, nodes).filter(n => n.selected === true));
  }


  // TODO RadStr: Old version
  // const newSelectedNodes = newUserSelectedNodes.concat(nodesInGroupWhichAreNotPartOfDragging.current);
  // selectedNodesRef.current = newSelectedNodes;
  // return newSelectedNodes;

  console.info("newSelectedNodes - newlyUnselectedNodesBasedOnGroups", newlyUnselectedNodesBasedOnGroups);
  console.info("newSelectedNodes - nodesWhichWereActuallyNotUnselected", nodesWhichWereActuallyNotUnselected);
  console.info("newSelectedNodes - nodesInGroupWhichAreNotPartOfDragging.current", [...nodesInGroupWhichAreNotPartOfDragging.current]);
  console.info("newSelectedNodes", newSelectedNodes);
  return newSelectedNodes;
};


const updateNodesBasedOnNodeChanges = (
  prevNodes: NodeType[],
  changes: NodeChange<NodeType>[],
  selectChanges: string[],
  unselectChanges: string[],
  newlyUnselectedNodesBasedOnGroups: string[],
  nodeToGroupMapping: Record<string, string>,
  userSelectedNodes: string[],
  groupsNewlyContainedInSelectionChange: Record<string, true>,
  userSelectedNodesRef: React.MutableRefObject<string[]>,
  onChangeEventsDebugRef: React.MutableRefObject<NodeChange[][]>,
) => {
  addNewChangesBasedOnGroups(newlyUnselectedNodesBasedOnGroups, unselectChanges, false, changes);
  console.info("Changes after after:", changes);
  onChangeEventsDebugRef.current.push([...changes]);
  console.info("onChangeEventsDebugRef", {...onChangeEventsDebugRef});
  console.info("onChangeEventsDebugRef.current len: ", onChangeEventsDebugRef.current.length);
  console.info(onChangeEventsDebugRef.current.length);
  const updatedNodes = applyNodeChanges(changes, prevNodes);

  // TODO RadStr: Debug prints
  if(userSelectedNodesRef.current.length !== updatedNodes.filter(node => node.selected === true).length) {
    console.info("!!! INCORRECT !!!");
    console.warn(userSelectedNodes);
    console.warn(userSelectedNodesRef.current);
    console.warn(updatedNodes.filter(node => node.selected === true));
    console.warn(selectChanges);
    console.warn(unselectChanges);
  }
  else {
    console.info("!!!CORRECT !!!");
  }


  if(Object.entries(groupsNewlyContainedInSelectionChange).length > 0) {
    for(const group of Object.keys(groupsNewlyContainedInSelectionChange)) {
      const groupNodeIndex = updatedNodes.findIndex(node => node.id === group);
      if(groupNodeIndex === -1) {
        continue;
      }
      updatedNodes[groupNodeIndex] = showGroupNode(updatedNodes[groupNodeIndex]);



      // if(updatedNodes.find(node => node.id === group) !== undefined) {
      //   continue;
      // }
      // const groupContent: Node<any>[] = [];
      // for(const nodeIdentifierInGroup of groups[group]) {
      //   const node = updatedNodes.find(node => node.id === nodeIdentifierInGroup);
      //   if(node === undefined) {
      //     continue;
      //   }
      //   // TODO RadStr: (keep this note - but remove the commented code after commit)
      //   //              Note - there is actually no need to have this since we are using the element purely visually,
      //   //              so we don't want to have the reactflow subflow logic
      //   // node.parentId = group;
      //   // node.extent = "parent";
      //   groupContent.push(node);
      // }
      // const groupNode = createGroupNode(group, groupContent);
      // updatedNodes.unshift(groupNode);
    }

    console.info("updated groups - updatedNodes", [...updatedNodes]);
  }

  for(const newlyUnselectedNode of newlyUnselectedNodesBasedOnGroups) {
    const processedGroups: Record<string, true> = {};
    const group = nodeToGroupMapping[newlyUnselectedNode];
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

  console.info("updated nodes", updatedNodes);
  return updatedNodes;
};

const addNewChangesBasedOnGroups = (
  selectionChangeBasedOnGroup: string[],
  elementsWithAlreadyChangedSelection: string[],
  isNewlySelected: boolean,
  nodeChanges: NodeChange<NodeType>[],
) => {
  // TODO RadStr: Debug prints
  console.warn("changeGroupSelection");
  console.warn(elementsWithAlreadyChangedSelection);
  console.warn(selectionChangeBasedOnGroup);
  for (const newlyChangedNode of selectionChangeBasedOnGroup) {
    if(elementsWithAlreadyChangedSelection.includes(newlyChangedNode)) {
      continue;
    }
    const newSelectionChange: NodeChange<NodeType> = {
      id: newlyChangedNode,
      type: "select",
      selected: isNewlySelected,
    }
    nodeChanges.push(newSelectionChange);
  }
}

const createEdgesChangeHandler = (
  setEdges: ReactPrevSetStateType<EdgeType[]>,
  setSelectedEdges: ReactPrevSetStateType<string[]>,
) => {
  return (changes: EdgeChange<EdgeType>[]) => {
    // TODO RadStr: Remove
    // setSelectedBasedOnChanges(setSelectedEdges, changes, null, null);
    setEdges((prevEdges) => {
      const edgesAfterChanges = applyEdgeChanges(changes, prevEdges);
      console.info("previouslySelectedEdges all edges ", changes, [...prevEdges], [...edgesAfterChanges]);
      const newlyRemoved: string[] = changes.filter(change => change.type === "remove").map(change => change.id);
      setSelectedBasedOnNewData(setSelectedEdges, edgesAfterChanges, null, newlyRemoved, null);
      return edgesAfterChanges;
    });
  };
};


// // TODO RadStr: If I actually keep it this way then I should definitely at least document it better - when the values are null and when not
/**
 * Helper method, sets selected elements based on changes. Elements are either nodes or edges, same for changes -
 * the changes and the elements should be for the same type (so either only for nodes or only for edges)
 * @deprecated Replaced by {@link setSelectedBasedOnNewData} - Remove later
 */
const setSelectedBasedOnChanges = (
  setSelected: ReactPrevSetStateType<string[]>,
  changes: NodeChange<NodeType>[] | EdgeChange<EdgeType>[],
  selectedNodesRef: React.MutableRefObject<string[]> | null,

  // TODO RadStr: DEBUG -
  nodes: NodeType[] | null
) => {
  setSelected(previouslySelected => {
    const newlySelected: string[] = [];
    const newlyRemoved: string[] = [];
    for(const change of changes) {
      if(change.type === "select") {
        if(change.selected) {
          newlySelected.push(change.id);
        }
        else {
          newlyRemoved.push(change.id);
        }
      }
    }

    if(newlySelected.length === 0 && newlyRemoved.length === 0) {
      return previouslySelected;
    }
    previouslySelected = previouslySelected.filter(previouslySelected => !newlyRemoved.includes(previouslySelected));
    previouslySelected.push(...newlySelected);
    const result = previouslySelected.map(id => id);
    // TODO RadStr: DEBUG
    if(nodes !== undefined && selectedNodesRef !== null) {
      console.info("setSelectedBasedOnChanges BEFORE - nodes");
      console.info({...nodes});
      console.info("setSelectedBasedOnChanges BEFORE");
      console.info({...selectedNodesRef.current});
      console.info("setSelectedBasedOnChanges AFTER");
      console.info({...result});
    }

    if(selectedNodesRef !== null) {
      selectedNodesRef.current = result;
    }
    return result;
  });
}

// TODO RadStr: Maybe improve the interface - we definitely don't need the nodes, but what about the selectedNodesRef - do we need it in the new program?
const setSelectedBasedOnNewData = (
  setSelected: ReactPrevSetStateType<string[]>,
  newData: NodeType[] | EdgeType[],
  selectedNodesRef: React.MutableRefObject<string[]> | null,
  newlyRemoved: string[],

  // TODO RadStr: DEBUG -
  nodes: NodeType[] | null,
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
    // TODO RadStr: DEBUG
    if(nodes !== undefined && selectedNodesRef !== null) {
      console.info("setSelectedBasedOnChanges BEFORE - nodes");
      console.info({...nodes});
      console.info("setSelectedBasedOnChanges BEFORE");
      console.info({...selectedNodesRef.current});
      console.info("setSelectedBasedOnChanges AFTER");
      console.info({...result});
    }

    if(selectedNodesRef !== null) {
      selectedNodesRef.current = result;
      console.info("result");
      console.info(result);
    }

    console.info("previouslySelectedEdges", result);
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
    const flowPosititon = reactFlow.screenToFlowPosition({x: (event as unknown as React.MouseEvent)?.clientX, y: (event as unknown as React.MouseEvent)?.clientY});
    if (targetIsPane) {
      api.callbacks().onCreateConnectionToNothing(source.data, flowPosititon);
    } else {
      if (connection.toNode === null) {
        // If user have not attached the node to the handle, we get no target.
        const nodes = reactFlow.getIntersectingNodes({ x: positionRelativeToViewport.x, y: positionRelativeToViewport.y, width: 1, height: 1 });
        if (nodes.length === 0) {
          api.callbacks().onCreateConnectionToNothing(source.data, flowPosititon);
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

const createOpenCanvasToolbarHandler = (setCanvasToolbar: (canvasToolbarProps: CanvasToolbarGeneralProps | null) => void): OpenCanvasContextMenuHandler => {
  return (sourceClassNode: ApiNode, canvasPosition: Position, toolbarContent: CanvasToolbarContentType) => {
    const sourceNodeIdentifier = sourceClassNode.identifier;
    setCanvasToolbar({ sourceNodeIdentifier, canvasPosition, toolbarContent });
  };
};

type OnPaneClickHandler = (event: React.MouseEvent) => void;

const createOnPaneClickHandler = (
  closeCanvasToolbar: () => void,
  setSelectedNodes: (newSelection: string[]) => void,
  setSelectedEdges: (newSelection: string[]) => void
): OnPaneClickHandler => {
  return (_: React.MouseEvent) => {
    closeCanvasToolbar();
    setSelectedNodes([]);
    setSelectedEdges([]);
  };
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
  setGroups: ReactPrevSetStateType<Record<string, string[]>>,
  setNodeToGroupMapping: ReactPrevSetStateType<Record<string, string>>,
): DiagramActions => {
  return {
    getGroups() {
      console.log("Diagram.getGroups");
      return [];
    },
    addGroup(group, content) {
      console.log("Diagram.addGroup", { group, content });
      setGroups(prevGroups => {
        return {...prevGroups, [group.identifier]: content};
      });

      setNodeToGroupMapping(prevMapping => {
        const newMapping = {...prevMapping};
        content.forEach(nodeIdGroupId => {
          newMapping[nodeIdGroupId] = group.identifier;
        });
        return newMapping;
      });

      setNodes(prevNodes => {
        return [createGroupNode(group.identifier, prevNodes.filter(node => content.includes(node.id)), false)].concat(prevNodes.map(node => {
          if(content.includes(node.id)) {
            if(node.data.group !== null) {    // Not sure if this ever happens and if it does if it is actually error worth
              console.error("Overriding existing group of node");
            }

            return {
              ...node,
              data: {
                ...node.data,
                group: group.identifier,
              },
            };
          }

          return node;
        }));
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
        // TODO RadStr: Maybe not the most effective solution - we could get the content of the removed groups first and then just remove all of them from keys
        const newMapping = {...prevMapping};
        Object.keys(newMapping).forEach(nodeIdentifier => {
          if(groups.includes(newMapping[nodeIdentifier])) {
            delete newMapping[nodeIdentifier];
          }
        });
        return newMapping;
      });

      setNodes(prevNodes => {
        return prevNodes.map(node => {
          if(node.data.group !== null && groups.includes(node.data.group)) {
            return {
              ...node,
              data: {
                ...node.data,
                group: null,
              },
            };
          }

          return node;
        });
      });
    },
    setGroup(group, content) {
      console.log("Diagram.setGroup", { group, content });
      return [];
    },
    getGroupContent(group) {
      console.log("Diagram.getGroupContent", { group });
      return [];
    },
    //
    getNodes() {
      console.log("Diagram.getNodes");
      // TODO RadStr: Using getNodes on reactflow vs using the nodes from the setState - is there difference in synchronicity??
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
        return changed[node.data.identifier] ?? node;
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
      // TODO RadStr: Old variant using the selected property
      // return reactFlow.getNodes().filter(node => node.selected === true).map(node => node.data);
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
    async setContent(nodes, edges) {
      setNodes(nodes.map(nodeToNodeType));
      alignment.onReset();
      setEdges(edges.map(edgeToEdgeType));
      console.log("Diagram.setContent", { nodes, edges });
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
    openDragEdgeToCanvasToolbar(sourceNode, canvasPosition) {
      console.log("openCanvasToolbar", {sourceNode, canvasPosition});
      context?.onOpenCanvasContextMenu(sourceNode, canvasPosition, CanvasToolbarCreatedByEdgeDrag);
    },
    openSelectionActionsToolbar(sourceNode, canvasPosition) {
      console.log("openCanvasToolbar", {sourceNode, canvasPosition});
      context?.onOpenCanvasContextMenu(sourceNode, canvasPosition, NodeSelectionActionsSecondaryToolbar);
    },
    highlightNodeInExplorationModeFromCatalog(nodeIdentifier, modelOfClassWhichStartedHighlighting) {
      changeHighlight(nodeIdentifier, reactFlow, false, modelOfClassWhichStartedHighlighting);
    }
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

const createDiagramContext = (
  api: UseDiagramType,
  onOpenEdgeContextMenu: OpenEdgeContextMenuHandler,
  onOpenCanvasContextMenu: OpenCanvasContextMenuHandler,
  openedCanvasToolbar: CanvasToolbarContentType | null,
  setCanvasToolbar: (_: null) => void,
  selectedNodes: string[],
  selectedEdges: string[],
  groups: Record<string, string[]>,
  nodeToGroupMapping: Record<string, string>,
  userSelectedNodes: string[],
): DiagramContextType => {
  const getShownNodeToolbarType = () => {
    let areAllSelectedNodesPartOfSomeGroup = true;
    let theGroup: string | null = null;
    // TODO RadStr: Debug - remove later
    // console.info("getShownNodeToolbarType");
    // console.info(selectedNodes);
    for(const selectedNode of selectedNodes) {
      const groupOfTheSelectedNode = nodeToGroupMapping[selectedNode];
      if(theGroup === null) {
        theGroup = groupOfTheSelectedNode;
      }
      if (groupOfTheSelectedNode === undefined || groupOfTheSelectedNode !== theGroup) {
        areAllSelectedNodesPartOfSomeGroup = false;
        break;
      }
    }
    if(theGroup === null || groups[theGroup]?.length !== selectedNodes.length) {
      areAllSelectedNodesPartOfSomeGroup = false;
    }

    if(areAllSelectedNodesPartOfSomeGroup) {
      return NodeToolbarType.GROUP_TOOLBAR;
    }
    if(selectedNodes.length > 1 || (selectedNodes.length === 1 && selectedEdges.length > 0)) {
      return NodeToolbarType.SELECTION_TOOLBAR;
    }
    else {
      return NodeToolbarType.SINGLE_NODE_TOOLBAR;
    }
  }
  const closeCanvasToolbar = () => setCanvasToolbar(null);
  const getAreOnlyEdgesSelected = () => {
    return selectedNodes.length === 0 && selectedEdges.length !== 0;
  };

  return {
    callbacks: api.callbacks,
    onOpenEdgeContextMenu,
    onOpenCanvasContextMenu,
    openedCanvasToolbar,
    closeCanvasToolbar,
    getNodeWithToolbar: () => userSelectedNodes.at(-1) ?? null,
    getShownNodeToolbarType,

    getAreOnlyEdgesSelected,
  };
};
