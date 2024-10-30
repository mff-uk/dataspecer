import { useCallback, useMemo, useRef, useState } from "react";

import type { DiagramCallbacks, DiagramActions } from "./diagram-api";

export interface UseDiagramType {

  /**
   * True when actions are ready.
   * Do not use actions before this is true.
   */
  areActionsReady: boolean;

  actions: () => DiagramActions;

  setActions: (nextActions: DiagramActions) => void;

  callbacks: () => DiagramCallbacks;

  setCallbacks: (nextCallbacks: DiagramCallbacks) => void;

}

/**
 * Do not use actions before they are ready.
 */
export const useDiagram = (): UseDiagramType => {
  // We keep this as a state, to trigger re-render.
  const [areActionsReady, setActionsReady] = useState(false);

  // Following are only refs, as we provide getter to return the current value.
  const actions = useRef<DiagramActions>(noOperationDiagramActions);
  const callbacks = useRef<DiagramCallbacks>(noOperationCallbacks);

  const getActions = useCallback(() => actions.current, [actions]);

  const getCallbacks = useCallback(() => callbacks.current, [callbacks]);

  return useMemo(() => {
    return {
      areActionsReady,
      actions: getActions,
      setActions: (nextActions) => {
        setActionsReady(true);
        actions.current = nextActions;
      },
      callbacks: getCallbacks,
      setCallbacks: (nextCallbacks) => {
        callbacks.current = nextCallbacks;
      },
    };
  }, [areActionsReady, getActions, setActionsReady, actions, getCallbacks, callbacks]);
};

const noOperation = () => {
  console.warn("Calling no operation function. You need to wait before the context is ready.");
};

const noOperationAsync = () => {
  console.warn("Calling no operation function. You need to wait before the context is ready.");
  return Promise.resolve();
};

const noOperationArray = () => {
  console.warn("Calling no operation function. You need to wait before the context is ready. Returning empty array.");
  return [];
};

const noOperationThrow = () => {
  throw new Error("Function not implemented.  You need to wait before the context is ready.");
};

/**
 * No operation implementation of actions.
 */
const noOperationDiagramActions: DiagramActions = {
  getNodes: noOperationArray,
  addNodes: noOperation,
  updateNodes: noOperation,
  removeNodes: noOperation,
  getEdges: noOperationArray,
  addEdges: noOperation,
  updateEdges: noOperation,
  removeEdges: noOperation,
  setContent: noOperationAsync,
  setViewportToPosition: noOperation,
  centerViewportToNode: noOperation,
  getGroups: noOperationArray,
  addGroup: noOperation,
  removeGroups: noOperation,
  setGroup: noOperation,
  getGroupContent: noOperationArray,
  updateNodesPosition: noOperation,
  setEdgesWaypointPosition: noOperation,
  getSelectedNodes: noOperationArray,
  setSelectedNodes: noOperation,
  getSelectedEdges: noOperationArray,
  setSelectedEdges: noOperation,
  getViewport: noOperationThrow,
};

const noOperationCallbacks: DiagramCallbacks = {
  onShowNodeDetail: noOperation,
  onEditNode: noOperation,
  onCreateNodeProfile: noOperation,
  onHideNode: noOperation,
  onDeleteNode: noOperation,
  onChangeNodePosition: noOperation,
  onShowEdgeDetail: noOperation,
  onEditEdge: noOperation,
  onCreateEdgeProfile: noOperation,
  onHideEdge: noOperation,
  onDeleteEdge: noOperation,
  onSelectionDidChange: noOperation,
  onCreateConnectionToNode: noOperation,
  onCreateConnectionToNothing: noOperation,
};
