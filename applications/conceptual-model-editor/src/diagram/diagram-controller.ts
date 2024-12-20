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
import { useCanvasHighlightingController } from "./features/highlighting/exploration/canvas/canvas-exploration-highlighting-controller";
import { useExploration } from "./features/highlighting/exploration/context/highlighting-exploration-mode";

export type NodeType = Node<ApiNode>;

export type EdgeType = Edge<ApiEdge>;

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

  shouldShowSelectionToolbar: () => boolean;

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
}

function useCreateReactStates() {
  const [nodes, setNodes] = useNodesState<NodeType>([]);
  const [edges, setEdges] = useEdgesState<EdgeType>([]);
  const [edgeToolbar, setEdgeToolbar] = useState<EdgeToolbarProps | null>(null);
  const [canvasToolbar, setCanvasToolbar] = useState<CanvasToolbarGeneralProps | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);

  return {
    nodes, setNodes,
    edges, setEdges,
    edgeToolbar, setEdgeToolbar,
    canvasToolbar, setCanvasToolbar,
    selectedNodes, setSelectedNodes,
    selectedEdges, setSelectedEdges,
  };
}

function useCreateDiagramControllerIndependentOnActionsAndContext(
  api: UseDiagramType,
  reactFlowInstance: ReactFlowInstance<NodeType, EdgeType>,
  createdReactStates: ReturnType<typeof useCreateReactStates>,
) {
  const { setNodes, setEdges, setEdgeToolbar, setCanvasToolbar, selectedNodes, setSelectedNodes, setSelectedEdges, selectedEdges } = createdReactStates;
  const alignmentController = useAlignmentController({ reactFlowInstance });
  const canvasHighlighting = useCanvasHighlightingController(setNodes, setEdges);

  // The initialized is set to false when new node is added and back to true once the size is determined.
  // const reactFlowInitialized = useNodesInitialized();

  // https://reactflow.dev/api-reference/hooks/use-key-press
  const isShiftPressed = useKeyPress('Shift');


  const onChangeSelection = useCallback(createChangeSelectionHandler(
      setSelectedNodes, setSelectedEdges),
      [setSelectedNodes, setSelectedEdges]);

  useOnSelectionChange({ onChange: (onChangeSelection) });

  const onNodesChange = useCallback(createNodesChangeHandler(
    setNodes, alignmentController, setSelectedNodes),
    [setNodes, alignmentController, setSelectedNodes]);

  const onEdgesChange = useCallback(createEdgesChangeHandler(
    setEdges, setSelectedEdges),
    [setEdges, setSelectedEdges]);

  useEffect(() => {
    setHighlightingStylesBasedOnSelection(reactFlowInstance, selectedNodes, selectedEdges, setNodes, setEdges);
  }, [selectedNodes, selectedEdges]);

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
  const onNodeDragStart = useCallback(createOnNodeDragStartHandler(alignmentController, canvasHighlighting.disableTemporarily), [alignmentController, canvasHighlighting.disableTemporarily]);
  const onNodeDragStop = useCallback(createOnNodeDragStopHandler(api, alignmentController, canvasHighlighting.enableTemporarily), [api, alignmentController, canvasHighlighting.enableTemporarily]);

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
  const { setNodes, setEdges, canvasToolbar, setCanvasToolbar, selectedNodes, selectedEdges, setSelectedNodes, setSelectedEdges } = createdReactStates;
  const { onOpenEdgeToolbar, onOpenCanvasToolbar, alignmentController } = createdPartOfDiagramController;

  const context = useMemo(() => createDiagramContext(
    api, onOpenEdgeToolbar, onOpenCanvasToolbar, canvasToolbar?.toolbarContent ?? null, setCanvasToolbar, selectedNodes, selectedEdges),
    [api, onOpenEdgeToolbar, onOpenCanvasToolbar, canvasToolbar, setCanvasToolbar, selectedNodes, selectedEdges]
  );

  const canvasHighlighting = useCanvasHighlightingController(setNodes, setEdges);
  const actions = useMemo(() => createActions(reactFlowInstance, setNodes, setEdges, alignmentController, context, setSelectedNodes, setSelectedEdges, canvasHighlighting.changeHighlight),
    [reactFlowInstance, setNodes, setEdges, alignmentController, context, setSelectedNodes, setSelectedEdges, canvasHighlighting.changeHighlight]);

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
  };
}

const createOnNodeDragHandler = () => {
  return (event: React.MouseEvent, node: Node, nodes: Node[]) => {
    // EMPTY
  };
};

const createOnNodeDragStartHandler = (alignmentController: AlignmentController, disableExplorationModeHighlightingChanges: () => void) => {
  return (event: React.MouseEvent, node: Node, nodes: Node[]) => {
    disableExplorationModeHighlightingChanges();
    alignmentController.alignmentSetUpOnNodeDragStart(node);
  };
};


const createOnNodeMouseEnterHandler = (
  changeHighlight: (startingNodeId: string, reactFlowInstance: ReactFlowInstance<NodeType, EdgeType>, isSourceOfEventCanvas: boolean) => void,
  reactFlowInstance: ReactFlowInstance<NodeType, EdgeType>,
) => {
  return (_: React.MouseEvent, node: Node) => {
    changeHighlight(node.id, reactFlowInstance, true);
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
  enableExplorationModeHighlightingChanges: () => void
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

const createNodesChangeHandler = (
  setNodes: React.Dispatch<React.SetStateAction<NodeType[]>>,
  alignmentController: AlignmentController,
  setSelectedNodes: React.Dispatch<React.SetStateAction<string[]>>,
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


    setSelectedBasedOnChanges(setSelectedNodes, changes);
    alignmentController.alignmentNodesChange(changes);
    setNodes((prevNodes) => applyNodeChanges(changes, prevNodes));
  };
};

const createEdgesChangeHandler = (
  setEdges: React.Dispatch<React.SetStateAction<EdgeType[]>>,
  setSelectedEdges: React.Dispatch<React.SetStateAction<string[]>>
) => {
  return (changes: EdgeChange<EdgeType>[]) => {
    setSelectedBasedOnChanges(setSelectedEdges, changes);
    setEdges((prevEdges) => applyEdgeChanges(changes, prevEdges));
  };
};

/**
 * Helper method, sets selected elements based on changes. Elements are either nodes or edges, same for changes -
 * the changes and the elements should be for the same type (so either only for nodes or only for edges)
 */
const setSelectedBasedOnChanges = (setSelected: React.Dispatch<React.SetStateAction<string[]>>, changes: NodeChange<NodeType>[] | EdgeChange<EdgeType>[]) => {
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
    return previouslySelected.map(id => id);
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

const createOnPaneClickHandler = (closeCanvasToolbar: () => void, setSelectedNodes: (newSelection: string[]) => void, setSelectedEdges: (newSelection: string[]) => void): OnPaneClickHandler => {
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
  changeHighlight: (startingNodeId: string, reactFlowInstance: ReactFlowInstance<NodeType, EdgeType>, isSourceOfEventCanvas: boolean) => void,
): DiagramActions => {
  return {
    getGroups() {
      console.log("Diagram.getGroups");
      return [];
    },
    addGroup(group, content) {
      console.log("Diagram.addGroup", { group, content });
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
    highlightNodeInExplorationModeFromCatalog(nodeIdentifier) {
      changeHighlight(nodeIdentifier, reactFlow, false);
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
    markerEnd: selectMarkerEnd(edge),
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

function selectMarkerEnd(edge: ApiEdge) {
  switch (edge.type) {
    case ApiEdgeType.Association:
      return { type: MarkerType.Arrow, height: 20, width: 20, color: edge.color };
    case ApiEdgeType.AssociationProfile:
      return { type: MarkerType.Arrow, height: 20, width: 20, color: edge.color };
    case ApiEdgeType.Generalization:
      return { type: MarkerType.ArrowClosed, height: 20, width: 20, color: edge.color };
    case ApiEdgeType.ClassProfile:
      return { type: MarkerType.ArrowClosed, height: 20, width: 20, color: edge.color };
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
): DiagramContextType => {
  const getLastSelected = () => {
    return selectedNodes.at(-1) ?? null;
  };
  const shouldShowSelectionToolbar = () => {
    return selectedNodes.length > 1 || (selectedNodes.length === 1 && selectedEdges.length > 0);
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
    shouldShowSelectionToolbar,

    getAreOnlyEdgesSelected,
  };
};
