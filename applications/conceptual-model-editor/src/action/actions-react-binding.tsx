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
import { createVocabulary } from "./create-vocabulary";
import { createClass } from "./create-class";
import { addNodeToVisualModelAction } from "./add-node-to-visual-model";
import { addRelationToVisualModelAction } from "./add-relation-to-visual-model";
import { deleteFromSemanticModelAction } from "./delete-from-semantic-model";
import { deleteFromVisualModelAction } from "./delete-from-visual-model";
import { useDiagram, type DiagramCallbacks } from "../diagram/";
import type { UseDiagramType } from "../diagram/diagram-hook";
import { useOptions, type Options } from "../application/options";
import { centerViewportToVisualEntityAction } from "./center-viewport-to-visual-entity";
import { createEntityDetailDialog } from "../dialog/obsolete/entity-detail-dialog";
import { isSemanticModelAttribute, isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelAttributeUsage, isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

export interface ActionsContextType {

  /**
   * Open dialog to add a new model.
   */
  openCreateModelDialog: () => void;

  /**
   * Open detail dialog, the type of the dialog is determined based on the
   * entity type.
   */
  openDetailDialog: (identifier: string) => void;

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

  removeFromVisualModel: (identifier: string) => void;

  centerViewportToVisualEntity: (model: string, identifier: string) => void;

  /**
   * As this context requires two way communication it is created and shared via the actions.
   */
  diagram: UseDiagramType | null;

}

const noOperationActionsContext = {
  openCreateModelDialog: noOperation,
  openDetailDialog: noOperation,
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
  logger.error("[ACTIONS] Using uninitialized actions context!");
}

function noOperationAsync() {
  logger.error("[ACTIONS] Using uninitialized actions context!");
  return Promise.resolve();
}

export const ActionsContextProvider = (props: {
  children: React.ReactNode,
}) => {
  const options = useOptions();
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

let prevOptions: Options | null = null;
let prevDialogs: DialogApiContextType | null = null;
let prevClasses: ClassesContextType | null = null;
let prevNotifications: UseNotificationServiceWriterType | null = null;
let prevGraph: ModelGraphContextType | null = null;
let prevDiagram: UseDiagramType | null = null;

function createActionsContext(
  options: Options | null,
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

  //
  const changed = [];
  if (prevOptions !== options) changed.push("options");
  if (prevDialogs !== dialogs) changed.push("dialogs");
  if (classes !== classes) changed.push("classes");
  if (notifications !== notifications) changed.push("notifications");
  if (graph !== graph) changed.push("graph");
  if (prevDiagram !== diagram) changed.push("diagram");
  console.info("[ACTIONS] Creating new context object. ", { changed });
  prevOptions = options;
  prevDialogs = dialogs;
  prevClasses = classes;
  prevNotifications = notifications;
  prevGraph = graph;
  prevDiagram = diagram;
  //

  const openDetailDialog = (identifier: string) => {
    const entity = graph.aggregatorView.getEntities()?.[identifier].rawEntity;
    if (entity === undefined) {
      notifications.error(`Can not find the entity with identifier '${identifier}'.`);
      return;
    }
    // In future we should have different dialogs based on the type, for now
    // we just fall through to a single dialog for all.
    if (isSemanticModelClass(entity)) {

    } else if (isSemanticModelClassUsage(entity)) {

    } else if (isSemanticModelAttribute(entity)) {

    } else if (isSemanticModelAttributeUsage(entity)) {

    } else if (isSemanticModelRelationship(entity)) {

    } else if (isSemanticModelRelationshipUsage(entity)) {

    } else if (isSemanticModelGeneralization(entity)) {

    } else {
      notifications.error(`Unknown entity type.`);
      return;
    }
    dialogs.openDialog(createEntityDetailDialog(entity, options.language));
  };

  const openCreateModelDialog = () => {
    const onConfirm = (state: CreateModelState) => {
      createVocabulary(graph, state);
    };
    //
    dialogs?.openDialog(createAddModelDialog(onConfirm));
  };

  const openCreateClassDialog = (model: InMemorySemanticModel) => {
    const onConfirm = (state: EditClassState) => {
      createClass(notifications, graph, model, null, state);
    };
    //
    dialogs?.openDialog(createEditClassDialog(model, options.language, onConfirm));
  };

  const addNodeToVisualModel = (model: string, identifier: string) => {
    // We position the new node to the center of the viewport.
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
    deleteFromVisualModelAction(notifications, graph, identifier);
  };

  const centerViewportToVisualEntity = (model: string, identifier: string) => {
    centerViewportToVisualEntityAction(notifications, graph, diagram, model, identifier);
  };

  // Prepare and set diagram callbacks.

  const callbacks: DiagramCallbacks = {

    onShowNodeDetail: (id) => openDetailDialog(id),

    onEditNode: (id) => {
      console.log("Application.onEditNode", { id });
    },

    onCreateNodeProfile: (id) => {
      console.log("Application.onCreateNodeProfile", { id });
    },

    onHideNode: (id) => {
      console.log("Application.onHideNode", { id });
    },

    onDeleteNode: (id) => {
      console.log("Application.onDeleteNode", { id });
    },

    onShowEdgeDetail: (id) => openDetailDialog(id),

    onEditEdge: (id) => {
      console.log("Application.onEditEdge", { id });
    },

    onCreateEdgeProfile: (id) => {
      console.log("Application.onCreateEdgeProfile", { id });
    },

    onHideEdge: (id) => {
      console.log("Application.onHideEdge", { id });
    },

    onDeleteEdge: (id) => {
      console.log("Application.onDeleteEdge", { id });
    },

    onCreateConnectionToNode: (source, target) => {
      console.log("Application.onCreateConnectionToNode", { source, target });
    },

    onCreateConnectionToNothing: (source, position) => {
      console.log("Application.onCreateConnectionToNothing", { source, position });
    },

    onSelectionDidChange: (nodes, edges) => {
      console.log("Application.onSelectionDidChange", { nodes, edges });
    },

  };

  diagram.setCallbacks(callbacks);

  return {
    openCreateModelDialog,
    openDetailDialog,
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
