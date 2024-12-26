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

  getLastSelected: () => string | null;

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

  todoDebugCreateGroup: () => void;
}

function useCreateReactStates() {
  const [nodes, setNodes] = useNodesState<NodeType>([]);
  const [edges, setEdges] = useEdgesState<EdgeType>([]);
  const [edgeToolbar, setEdgeToolbar] = useState<EdgeToolbarProps | null>(null);
  const [canvasToolbar, setCanvasToolbar] = useState<CanvasToolbarGeneralProps | null>(null);
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

  return {
    nodes, setNodes,
    edges, setEdges,
    edgeToolbar, setEdgeToolbar,
    canvasToolbar, setCanvasToolbar,
    selectedNodes, setSelectedNodes,
    selectedEdges, setSelectedEdges,
    groups, setGroups,
    nodeToGroupMapping, setNodeToGroupMapping,
    nodesInGroupWhichAreNotPartOfDragging,
    selectedNodesRef,
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
    selectedNodesRef
   } = createdReactStates;
  const alignmentController = useAlignmentController({ reactFlowInstance });
  const canvasHighlighting = useExplorationCanvasHighlightingController(setNodes, setEdges);

  // The initialized is set to false when new node is added and back to true once the size is determined.
  // const reactFlowInitialized = useNodesInitialized();

  const onChangeSelection = useCallback(createChangeSelectionHandler(
      setSelectedNodes, setSelectedEdges),
      [setSelectedNodes, setSelectedEdges]);

  useOnSelectionChange({ onChange: (onChangeSelection) });

  const onNodesChange = useCallback(createNodesChangeHandler(
    nodes, setNodes, alignmentController, setSelectedNodes, groups, nodeToGroupMapping, nodesInGroupWhichAreNotPartOfDragging, selectedNodesRef),
    [nodes, setNodes, alignmentController, setSelectedNodes, groups, nodeToGroupMapping, nodesInGroupWhichAreNotPartOfDragging, selectedNodesRef]);

  const onEdgesChange = useCallback(createEdgesChangeHandler(
    setEdges, setSelectedEdges, selectedNodesRef),
    [setEdges, setSelectedEdges, selectedNodesRef]);

  useEffect(() => {
    if(!canvasHighlighting.isHighlightingOn) {
      setHighlightingStylesBasedOnSelection(reactFlowInstance, selectedNodes, selectedEdges, setNodes, setEdges);
    }
  }, [selectedNodes, selectedEdges, canvasHighlighting.isHighlightingOn]);

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
    alignmentController, canvasHighlighting.disableTemporarily, nodesInGroupWhichAreNotPartOfDragging, selectedNodesRef),
    [alignmentController, canvasHighlighting.disableTemporarily, nodesInGroupWhichAreNotPartOfDragging, selectedNodesRef]);
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
    setNodes, setEdges, canvasToolbar, setCanvasToolbar, selectedNodes, selectedEdges,
    setSelectedNodes, setSelectedEdges, setGroups,
    nodeToGroupMapping, setNodeToGroupMapping
  } = createdReactStates;
  const { onOpenEdgeToolbar, onOpenCanvasToolbar, alignmentController } = createdPartOfDiagramController;

  const context = useMemo(() => createDiagramContext(
    api, onOpenEdgeToolbar, onOpenCanvasToolbar, canvasToolbar?.toolbarContent ?? null, setCanvasToolbar, selectedNodes, selectedEdges, nodeToGroupMapping),
    [api, onOpenEdgeToolbar, onOpenCanvasToolbar, canvasToolbar, setCanvasToolbar, selectedNodes, selectedEdges, nodeToGroupMapping]
  );

  const canvasHighlighting = useExplorationCanvasHighlightingController(setNodes, setEdges);
  const actions = useMemo(() => createActions(reactFlowInstance, setNodes, setEdges, alignmentController, context,
    setSelectedNodes, setSelectedEdges, canvasHighlighting.changeHighlight, setGroups, setNodeToGroupMapping),
    [reactFlowInstance, setNodes, setEdges, alignmentController, context,
      setSelectedNodes, setSelectedEdges, canvasHighlighting.changeHighlight, setGroups, setNodeToGroupMapping]);

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

// TODO RadStr: Testing reactflow groups
const todoDebugCreateGroup = (setNodes: React.Dispatch<React.SetStateAction<NodeType[]>>, groupIdSuffix: React.MutableRefObject<number>) => {
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


  setNodes(prevNodes => {
    const selectedNodes = prevNodes.map(n => n.selected === true ? n : null).filter(n => n !== null).filter(n => n.parentId === undefined);

    const groupNodePosition = getTopLeftPosition(selectedNodes);
    const botRightGroupNodePosition = getBotRightPosition(selectedNodes);

    console.info("groupNodePosition");
    console.info(groupNodePosition);
    console.info(botRightGroupNodePosition);


    const groupId = "grupa" + groupIdSuffix.current.toString();

    const groupNode: Node<any> = {
          id: groupId,
          position: groupNodePosition,
          // className: 'light',
          draggable: false,
          selectable: false,
          style: {
              zIndex: -1000,
              // backgroundColor: "rgba(255, 0, 255, 0.04)",
              backgroundColor: "rgba(255, 0, 0, 0)",
              width: botRightGroupNodePosition.x - groupNodePosition.x,
              height: botRightGroupNodePosition.y - groupNodePosition.y,
              // border: "none",
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
          type: "resizableNode",
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

      selectedNodes.forEach(node => {
          node.parentId = groupId;
          node.extent = "parent";
          node.style = {
              ...node.style,
              zIndex: 1,
          };
      });

      groupIdSuffix.current += 1;

      // return prevNodes.map(node => {
      //     const replacementNode = selectedNodes.find(n => n.id === node.id);
      //     if(replacementNode !== undefined) {
      //         return {...replacementNode};
      //     }

      //     return node;
      // }).concat([groupNode]);

      // !!!!! The order matters - groups have to be first !!!!!!
      return [groupNode].concat(prevNodes.map(node => {
          const replacementNode = selectedNodes.find(n => n.id === node.id);
          if(replacementNode !== undefined) {
              replacementNode.position.x -= groupNodePosition.x;
              replacementNode.position.y -= groupNodePosition.y;
              return {...replacementNode};
          }

          return node;
      }));

  });

}


export function useDiagramController(api: UseDiagramType): UseDiagramControllerType {
  const reactStates = useCreateReactStates();
  // We can use useStore get low level access.
  const reactFlowInstance = useReactFlow<NodeType, EdgeType>();
  const independentPartOfDiagramController = useCreateDiagramControllerIndependentOnActionsAndContext(api, reactFlowInstance, reactStates);
  const dependentPartOfDiagramController = useCreateDiagramControllerDependentOnActionsAndContext(api, reactFlowInstance, reactStates, independentPartOfDiagramController);

  // TODO RadStr: Testing reactflow groups
  const groupIdSuffix = useRef<number>(0);
  const todoDebugCreateGroupCallback = useCallback(() => todoDebugCreateGroup(reactStates.setNodes, groupIdSuffix), [reactStates.setNodes, groupIdSuffix]);

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
    todoDebugCreateGroup: todoDebugCreateGroupCallback,

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
  nodesInGroupWhichAreNotPartOfDragging: React.MutableRefObject<string[]>,
  selectedNodesRef: React.MutableRefObject<string[]>,
) => {
  return (event: React.MouseEvent, node: Node, nodes: Node[]) => {
    disableExplorationModeHighlightingChanges();
    if(selectedNodesRef.current.length !== nodes.length) {
// TODO RadStr: Rename the outsiders and the nodesInGroup method argument (the name is used on multiple places)
      const outsiders = [];
      console.info("createOnNodeDragStartHandler");
      console.info(selectedNodesRef.current);
      console.info(nodes);
      for(const selectedNode of selectedNodesRef.current) {
        if(nodes.find(draggedNode => draggedNode.id === selectedNode) === undefined) {
          outsiders.push(selectedNode);
        }
      }
      if(outsiders.length !== 0) {
        nodesInGroupWhichAreNotPartOfDragging.current = outsiders;
        console.info("setNodesInGroupWhichAreNotPartOfDragging(outsiders)");
        console.info(outsiders);
      }
    }
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
    nodesInGroupWhichAreNotPartOfDragging.current = [];
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

    //

    // This solves the issue that when user drags single node, the node itself becomes selected but it is not separate selection event in the onNodesChange
    // So the trick is to just empty the selection if both selections are empty

    // You might be asking why not just do everything here? Why split into 3 different methods (this, onNodesChange, onEdgesChange).
    // Well there are many reasons -
    //     1) This method is called later, which results in flickering of the highlighting and onSelection toolbar menu (it shows for a while the classic menu instead of the selection one)
    //     2) It isn't one call - If we shift-select node it is actually split into 3 calls - select only nodes, only edges, select both - so we have to solve it specifically
    //                  - and even worse for ctrl selection it is again different and it seems that sometimes they might be different amount of calls etc.
    //        So the issue is that there are many ways to change selection and the behavior is different for each
    // Maybe there exists better solution, but I tried many and this was the first one which seems to work almost always (except for one TODO:) without much hassle

    // TODO RadStr: Currently there is issue that if user shift selects group of nodes and then moves them and then control select any node, the old selection is highlighted
    //              This is related to the fact that currently ending the node drag event ends the node selection (because they are changed in visual model and the callback remades the nodes)
    //              But it is not the same case for edges .... So I feel like it doesn't make sense to try it fix now, since the callbacks might change and this will become non-issue
    //              ...... Because the actual behavior should be that the nodes are still selected even after dragging, so after fixing it in visual model, this will become non-issue
    if(nodes.length === 0 && edges.length === 0) {
      setSelectedNodes([]);
      setSelectedEdges([]);
    }
  }
};

//////


// TODO RadStr: Experimenting with manually clicking the node ... remove these commented lines later
//              Copy-pasted and slightly changed from https://stackoverflow.com/questions/6157929/how-to-simulate-a-mouse-click

// function simulate(element: any, eventName: any) {
//   var options = extend(defaultOptions, arguments[2] || {});
//   var oEvent, eventType = null;

//   for (var name in eventMatchers) {
//     if (eventMatchers[name].test(eventName)) {
//       eventType = name;
//       break;
//     }
//   }

//   if (!eventType)
//     throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

//   if (document.createEvent) {
//     oEvent = document.createEvent(eventType);
//     if (eventType == 'HTMLEvents') {
//       oEvent.initEvent(eventName, options.bubbles, options.cancelable);
//     } else {
//       if(document.defaultView === null) {
//         return;
//       }
//       (oEvent as MouseEvent).initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
//         options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
//         options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
//     }
//     element.dispatchEvent(oEvent);
//   } else {
//     options.clientX = options.pointerX;
//     options.clientY = options.pointerY;
//     var evt = document.createEvent("MouseEvent");     // TODO RadStr: Changed
//     oEvent = extend(evt, options);
//     element.fireEvent('on' + eventName, oEvent);
//   }
//   return element;
// }

// function extend(destination: any, source: any) {
//   for (var property in source)
//     destination[property] = source[property];
//   return destination;
// }

// var eventMatchers: Record<string, RegExp> = {
//   "HTMLEvents": /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
//   "MouseEvents": /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
// }
// var defaultOptions = {
//   pointerX: 0,
//   pointerY: 0,
//   button: 0,
//   ctrlKey: false,
//   altKey: false,
//   shiftKey: false,
//   metaKey: false,
//   bubbles: true,
//   cancelable: true
// }


//////

const createNodesChangeHandler = (
  nodes: NodeType[],
  setNodes: ReactPrevSetStateType<NodeType[]>,
  alignmentController: AlignmentController,
  setSelectedNodes: ReactPrevSetStateType<string[]>,
  groups: Record<string, string[]>,
  nodeToGroupMapping: Record<string, string>,
  nodesInGroupWhichAreNotPartOfDragging: React.MutableRefObject<string[]>,
  selectedNodesRef: React.MutableRefObject<string[]>
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


    // console.info("groups", groups);
    // console.info("nodeToGroupMapping", nodeToGroupMapping);
    console.info("changes", changes);
    const newlySelectedNodesBasedOnGroups: string[] = [];
    const newlyUnselectedNodesBasedOnGroups: string[] = [];
    const changedSelectionByUser: string[] = [];
    for (const change of changes) {
      if(change.type === "select") {
        changedSelectionByUser.push(change.id);
        if(nodeToGroupMapping[change.id] !== undefined) {
          if(change.id.startsWith("grupa")) {
            continue;
          }
          if(change.selected) {
            for (const nodeInGroup of groups[nodeToGroupMapping[change.id]]) {
              if(nodes.find(node => node.id === nodeInGroup)?.selected !== true) {
                if(nodeInGroup === undefined) {
                  console.info("UNDEFINED");
                  console.info(change.id);
                  console.info(groups);
                  console.info(nodeToGroupMapping);
                  alert("UNDEFINED");
                }
                newlySelectedNodesBasedOnGroups.push(nodeInGroup);
              }
            }
          }
          else {
            for (const nodeInGroup of groups[nodeToGroupMapping[change.id]]) {
              if(nodes.find(node => node.id === nodeInGroup)?.selected === true) {
                newlyUnselectedNodesBasedOnGroups.push(nodeInGroup);
              }
            }
          }
        }
      }
    }

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




    console.info("newlyUnselectedNodesBasedOnGroups");
    console.info(newlyUnselectedNodesBasedOnGroups);
    console.info(newlySelectedNodesBasedOnGroups);

    changeGroupSelection(setNodes, newlyUnselectedNodesBasedOnGroups, changedSelectionByUser, false, changes);
    changeGroupSelection(setNodes, newlySelectedNodesBasedOnGroups, changedSelectionByUser, true, changes);

    // let positionDifference;
    // for (const change of changes) {
    //   if(change.type === "position" && change.dragging === true && alreadySelected.includes(change.id)) {
    //     positionDifference = {...change.position};                // TODO: For now position, but should be absolute probably
    //     const sourceNode = nodes.find(node => node.id === change.id);   // TODO: Should probably use the prevNodes instead. Therefore I don't even need the nodes
    //     if(positionDifference.x === undefined) {
    //       positionDifference.x = 0;
    //     }
    //     if(positionDifference.y === undefined) {
    //       positionDifference.y = 0;
    //     }
    //     positionDifference.x -= sourceNode?.position.x ?? 0;
    //     positionDifference.y -= sourceNode?.position.y ?? 0;


    //     console.info("positionDifference");
    //     console.info(positionDifference);
    //     console.info(sourceNode?.position);
    //     console.info({...change.position});
    //     for(const node of nodes) {
    //       if(node.id === change.id) {
    //         continue;
    //       }
    //       changes.push({
    //         type: "position",
    //         id: node.id,
    //         position: {
    //           x: node.position.x + (positionDifference.x ?? 0),
    //           y: node.position.y + (positionDifference.y ?? 0),
    //         },
    //         dragging: false,
    //       });
    //     }

    //   }
    // }

    // if(positionDifference !== undefined) {
    //   for(const node of nodes) {
    //     if(alreadySelected.includes(node.id)) {
    //       continue;
    //     }

    //     changes.push({
    //       type: "position",
    //       id: node.id,
    //       position: {
    //         x: node.position.x + (positionDifference.x ?? 0),
    //         y: node.position.y + (positionDifference.y ?? 0),
    //       },
    //       dragging: false,
    //     });
    //   }
    // }



    console.info("nodesInGroupWhichAreNotPartOfDragging.current.length");
    console.info(nodesInGroupWhichAreNotPartOfDragging.current.length);
    if(nodesInGroupWhichAreNotPartOfDragging.current.length > 0) {
      let positionDifference;
      for (const change of changes) {
        if(change.type === "position" && change.dragging === true) {
          positionDifference = {...change.position};                // TODO: For now position, but should be absolute probably
          const sourceNode = nodes.find(node => node.id === change.id);   // TODO: Should probably use the prevNodes instead. Therefore I don't even need the nodes
          if(positionDifference.x === undefined) {
            positionDifference.x = 0;
          }
          if(positionDifference.y === undefined) {
            positionDifference.y = 0;
          }
          positionDifference.x -= sourceNode?.position.x ?? 0;
          positionDifference.y -= sourceNode?.position.y ?? 0;


          // TODO RadStr: Debug prints
          console.info("positionDifference");
          console.info({...nodes.filter(n => n.selected === true)});
          console.info(positionDifference);
          console.info(sourceNode?.position);
          console.info({...change.position});
          console.warn(nodesInGroupWhichAreNotPartOfDragging.current);
          console.warn({...nodes.filter(n => n.selected === true)});

          for(const node of nodes) {
            console.info("node");
            console.info(node);

            if(!nodesInGroupWhichAreNotPartOfDragging.current.includes(node.id)) {
              continue;
            }

            changes.push({
              id: node.id,
              type: "position",
              position: {
                x: node.position.x + (positionDifference.x ?? 0),
                y: node.position.y + (positionDifference.y ?? 0),
              },
              dragging: false,
            });



            // TODO RadStr: Experimenting with manually clicking the node ... remove this comment later

            // // simulate(document.getElementById(node.id), "mouseup");
            // // // simulate(document.getElementById(node.id), "mousedown");
            // // simulate(document.getElementById(node.id), "click");

            // let evt = new MouseEvent("mouseup", {
            //   view: window,
            //   bubbles: true,
            //   cancelable: true,
            //   /* whatever properties you want to give it */
            // });
            // document.getElementById(node.id)?.dispatchEvent(evt);

            // evt = new MouseEvent("mousedown", {
            //   view: window,
            //   bubbles: true,
            //   cancelable: true,
            //   /* whatever properties you want to give it */
            // });
            // document.getElementById(node.id)?.dispatchEvent(evt);
            // return;
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



    setSelectedBasedOnChanges(setSelectedNodes, changes, selectedNodesRef);
    alignmentController.alignmentNodesChange(changes);
    setNodes((prevNodes) => applyNodeChanges(changes, prevNodes));
  };
};

const changeGroupSelection = (
  setNodes: ReactPrevSetStateType<NodeType[]>,
  selectionChangeBasedOnGroup: string[],
  elementsAlreadyWithAlreadyChangedSelection: string[],
  isNewlySelected: boolean,
  nodeChanges: NodeChange<NodeType>[],
) => {
  // TODO RadStr: Debug prints
  console.warn("changeGroupSelection");
  console.warn(elementsAlreadyWithAlreadyChangedSelection);
  console.warn(selectionChangeBasedOnGroup);
  let addedAtLeastOneChange = false;
  for (const newlyChangedNode of selectionChangeBasedOnGroup) {
    if(newlyChangedNode.startsWith("grupa") || elementsAlreadyWithAlreadyChangedSelection.includes(newlyChangedNode)) {
      continue;
    }
    const newSelectionChange: NodeChange<NodeType> = {
      id: newlyChangedNode,
      type: "select",
      selected: isNewlySelected,
    }
    nodeChanges.push(newSelectionChange);
    addedAtLeastOneChange = true;
  }

  // TODO RadStr: Just testing with this condition, I tihnk that this is the way to work with it, but the condition is jstu for testing
  // TODO RadStr: Testing reactflow groups
  // if(addedAtLeastOneChange && isNewlySelected) {
  // // if(!isNewlySelected || addedAtLeastOneChange) {
  //   setNodes(prevNodes => {
  //     return prevNodes.map(node => {
  //       if(node.id.startsWith("grupa")) {
  //         return {
  //           ...node,
  //           draggable: isNewlySelected,
  //           selectable: isNewlySelected,
  //           selected: isNewlySelected,
  //           style: {...node.style, backgroundColor: isNewlySelected ? "rgba(255, 0, 255, 0.04)" : "rgba(255, 0, 0, 0)"},
  //         };
  //       }
  //       return node;
  //     });
  //   });
  // }
}

const createEdgesChangeHandler = (
  setEdges: ReactPrevSetStateType<EdgeType[]>,
  setSelectedEdges: ReactPrevSetStateType<string[]>,
  selectedNodesRef: React.MutableRefObject<string[]>,
) => {
  return (changes: EdgeChange<EdgeType>[]) => {
    setSelectedBasedOnChanges(setSelectedEdges, changes, selectedNodesRef);
    setEdges((prevEdges) => applyEdgeChanges(changes, prevEdges));
  };
};

/**
 * Helper method, sets selected elements based on changes. Elements are either nodes or edges, same for changes -
 * the changes and the elements should be for the same type (so either only for nodes or only for edges)
 */
const setSelectedBasedOnChanges = (
  setSelected: ReactPrevSetStateType<string[]>,
  changes: NodeChange<NodeType>[] | EdgeChange<EdgeType>[],
  selectedNodesRef: React.MutableRefObject<string[]>,
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
    selectedNodesRef.current = result;
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
  setSelectedNodesInternal: (newSelection: string[]) => void,
  setSelectedEdgesInternal: (newSelection: string[]) => void,
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
    },
    removeGroups(groups) {
      console.log("Diagram.removeGroups", { groups });
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
      return [];
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
      return reactFlow.getNodes().filter(node => node.selected === true).map(node => node.data);
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
  nodeToGroupMapping: Record<string, string>,
): DiagramContextType => {
  const getLastSelected = () => {
    return selectedNodes.at(-1) ?? null;
  };
  const getShownNodeToolbarType = () => {
    let areAllSelectedNodesPartOfSomeGroup = true;
    for(const selectedNode of selectedNodes) {
      if (nodeToGroupMapping[selectedNode] === undefined) {
        areAllSelectedNodesPartOfSomeGroup = false;
        break;
      }
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
  };
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
    getLastSelected,
    getShownNodeToolbarType,

    getAreOnlyEdgesSelected,
  };
};
