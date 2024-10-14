import React, { useContext, useMemo } from "react";

import { type InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";

import { type DialogApiContextType } from "../dialog/dialog-service";
import { DialogApiContext } from "../dialog/dialog-context";
import { logger } from "../application";
import { type EditClassState } from "../dialog/class/edit-class-dialog-controller";
import { type ClassesContextType, ClassesContext } from "../context/classes-context";
import { useNotificationServiceWriter } from "../notification";
import { type UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ModelGraphContext, type ModelGraphContextType } from "../context/model-context";
import { createAddModelDialog } from "../dialog/model/create-model-dialog";
import { type CreateModelState } from "../dialog/model/create-model-dialog-controller";
import { createEditClassDialog } from "../dialog/class/edit-class-dialog";
import { ConfigurationContext, type ConfigurationContextType } from "../context/configuration-context";
import { createVocabulary } from "./create-vocabulary";
import { createClass } from "./create-class";
import { addNodeToVisualModelAction } from "./add-node-to-visual-model";
import { addRelationToVisualModelAction } from "./add-relation-to-visual-model";
import { deleteFromSemanticModelAction } from "./delete-from-semantic-model";
import { deleteFromVisualModelAction } from "./delete-from-visual-model";
import { useDiagram, type DiagramCallbacks } from "../diagram/";
import type { UseDiagramType } from "../diagram/diagram-hook";

export interface ActionsContextType {

  /**
   * Open dialog to add a new model.
   */
  openCreateModelDialog: () => void;

  /**
   * Open dialog to create a new class.
   * When position is provided the class is also inserted to the canvas.
   */
  openCreateClassDialog: (model: InMemorySemanticModel) => void;

  /**
   * Position is determined by the action.
   */
  addNodeToVisualModel: (model: string, identifier: string) => void;

  addNodeToVisualModelToPosition: (model: string, identifier: string, position: { x: number, y: number }) => void;

  addRelationToVisualModel: (model: string, identifier: string) => void;

  deleteFromSemanticModel: (model: string, identifier: string) => Promise<void>;

  // TODO Change name to deleteFromVisualModel
  removeFromVisualModel: (identifier: string) => void;

  centerViewportToVisualEntity: (model: string, identifier: string) => void;

  /**
   * As this context requires two way communication it is created and shared via the actions.
   */
  diagram: UseDiagramType | null;

}

const noOperationActionsContext = {
  openCreateModelDialog: noOperation,
  openCreateClassDialog: noOperation,
  addNodeToVisualModel: noOperation,
  addNodeToVisualModelToPosition: noOperation,
  addRelationToVisualModel: noOperation,
  deleteFromSemanticModel: noOperationAsync,
  removeFromVisualModel: noOperation,
  centerViewportToVisualEntity: noOperation,
  diagram: null,
};

export const ActionContext = React.createContext<ActionsContextType>(noOperationActionsContext);

function noOperation() {
  logger.error("Using uninitialized actions context!");
}

function noOperationAsync() {
  logger.error("Using uninitialized actions context!");
  return Promise.resolve();
}

export const ActionsContextProvider = (props: {
  children: React.ReactNode,
}) => {
  const options = useContext(ConfigurationContext);
  const dialogs = useContext(DialogApiContext);
  const classes = useContext(ClassesContext);
  const notifications = useNotificationServiceWriter();
  const graph = useContext(ModelGraphContext);
  const diagram = useDiagram();

  const actions = useMemo(
    () => createActionsContext(options, dialogs, classes, notifications, graph, diagram),
    [options, dialogs, classes, notifications, graph, diagram]
  );

  return (
    <ActionContext.Provider value={actions}>
      {props.children}
    </ActionContext.Provider>
  );
};

function createActionsContext(
  options: ConfigurationContextType | null,
  dialogs: DialogApiContextType | null,
  classes: ClassesContextType | null,
  notifications: UseNotificationServiceWriterType | null,
  graph: ModelGraphContextType | null,
  diagram: UseDiagramType,
): ActionsContextType {
  if (options === null || dialogs === null || classes === null || notifications === null || graph === null || !diagram.areActionsReady) {
    // We need to return the diagram object so it can be consumed by
    // the Diagram component and initialized.
    return {
      ...noOperationActionsContext,
      diagram,
    };
  }

  console.info("createActionsContext is creating new actions object.");

  const callbacks: DiagramCallbacks = {

    onShowNodeDetail: (id) => console.log("Application.onShowNodeDetail", { id }),

    onEditNode: (id) => console.log("Application.onEditNode", { id }),

    onCreateNodeProfile: (id) => console.log("Application.onCreateNodeProfile", { id }),

    onHideNode: (id) => console.log("Application.onHideNode", { id }),

    onDeleteNode: (id) => console.log("Application.onDeleteNode", { id }),

    onShowEdgeDetail: (id) => console.log("Application.onShowEdgeDetail", { id }),

    onEditEdge: (id) => console.log("Application.onEditEdge", { id }),

    onCreateEdgeProfile: (id) => console.log("Application.onCreateEdgeProfile", { id }),

    onHideEdge: (id) => console.log("Application.onHideEdge", { id }),

    onDeleteEdge: (id) => console.log("Application.onDeleteEdge", { id }),

    onCreateConnectionToNode: (source, target) => console.log("Application.onCreateConnectionToNode", { source, target }),

    onCreateConnectionToNothing: (source, position) => console.log("Application.onCreateConnectionToNothing", { source, position }),

    onSelectionDidChange: (nodes, edges) => console.log("Application.onSelectionDidChange", { nodes, edges }),

  };

  diagram.setCallbacks(callbacks);

  const openCreateModelDialog = () => {
    const onConfirm = (state: CreateModelState) => {
      createVocabulary(graph, state);
    };

    dialogs?.openDialog(createAddModelDialog(onConfirm));
  };

  const openCreateClassDialog = (model: InMemorySemanticModel) => {
    const onConfirm = (state: EditClassState) => {
      createClass(notifications, graph, model, null, state);
    };

    dialogs?.openDialog(createEditClassDialog(model, options.language, onConfirm));
  };

  const addNodeToVisualModel = (model: string, identifier: string) => {
    const viewport = diagram.actions().getViewport();
    const position = {
      x: viewport.position.x + (viewport.width / 2),
      y: viewport.position.y + (viewport.height / 2),
    };
    addNodeToVisualModelAction(notifications, graph, model, identifier, position);
  };

  const addNodeToVisualModelToPosition = (model: string, identifier: string, position: { x: number, y: number }) => {
    addNodeToVisualModelAction(notifications, graph, model, identifier, position);
  };

  const addRelationToVisualModel = (model: string, identifier: string) => {
    addRelationToVisualModelAction(notifications, graph, model, identifier);
  };

  const deleteFromSemanticModel = (model: string, identifier: string) => {
    return deleteFromSemanticModelAction(notifications, graph, model, identifier);
  };

  const removeFromVisualModel = (identifier: string) => {
    if (notifications === null || graph === null) {
      console.error("Contexts are not ready.");
      return;
    }
    deleteFromVisualModelAction(notifications, graph, identifier);
  };

  const centerViewportToVisualEntity = (model: string, identifier: string) => {
    // TODO Extract to an action file.
    const visualModel = graph.aggregatorView.getActiveVisualModel();
    if (visualModel === null) {
      notifications.error("There is no active visual model.");
      return;
    }
    const entity = visualModel.getVisualEntityForRepresented(identifier);
    if (entity === null) {
      notifications.error("There is no visual representation of the entity.");
      return;
    }
    diagram.actions().centerViewportToNode(entity.identifier);
  };

  return {
    openCreateModelDialog,
    openCreateClassDialog,
    addNodeToVisualModel,
    addNodeToVisualModelToPosition,
    addRelationToVisualModel,
    deleteFromSemanticModel,
    removeFromVisualModel,
    centerViewportToVisualEntity,
    diagram,
  };

}

export const useActions = (): ActionsContextType => {
  return useContext(ActionContext);
};
