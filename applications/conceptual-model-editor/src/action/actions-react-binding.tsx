import React, { useContext, useMemo } from "react";

import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { isVisualProfileRelationship, isVisualRelationship, isWritableVisualModel, Waypoint, WritableVisualModel } from "@dataspecer/core-v2/visual-model";

import { type DialogApiContextType } from "../dialog/dialog-service";
import { DialogApiContext } from "../dialog/dialog-context";
import { configuration, createLogger } from "../application";
import { type ClassesContextType, ClassesContext, useClassesContext, UseClassesContextType } from "../context/classes-context";
import { useNotificationServiceWriter } from "../notification";
import { type UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ModelGraphContext, type ModelGraphContextType } from "../context/model-context";
import { Edge, Position, useDiagram, type DiagramCallbacks, type Waypoint as DiagramWaypoint } from "../diagram/";
import type { UseDiagramType } from "../diagram/diagram-hook";
import { useOptions, type Options } from "../application/options";
import { centerViewportToVisualEntityAction } from "./center-viewport-to-visual-entity";
import { openDetailDialogAction } from "./open-detail-dialog";
import { openModifyDialogAction } from "./open-modify-dialog";
import { findSourceModelOfEntity } from "../service/model-service";
import { openCreateProfileDialogAction } from "./open-create-profile-dialog";
import { openCreateConnectionDialogAction } from "./open-create-connection";
import { openCreateClassDialogAction } from "./open-create-class-dialog";
import { openCreateVocabularyAction } from "./open-create-vocabulary";
import { addSemanticClassToVisualModelAction } from "./add-class-to-visual-model";
import { addSemanticClassProfileToVisualModelAction } from "./add-class-profile-to-visual-model";
import { addSemanticGeneralizationToVisualModelAction } from "./add-generalization-to-visual-model";
import { addSemanticRelationshipToVisualModelAction } from "./add-relationship-to-visual-model";
import { addSemanticRelationshipProfileToVisualModelAction } from "./add-relationship-profile-to-visual-model";
import { getViewportCenter } from "./utilities";
import { removeFromVisualModelAction } from "./remove-from-visual-model";
import { removeFromSemanticModelAction } from "./remove-from-semantic-model";
import { openCreateAttributeDialogAction } from "./open-create-attribute-dialog";
import { openCreateAssociationDialogAction } from "./open-create-association-dialog";
import { changeSelectionVisibilityAction } from "./change-selection-visibility";
import { removeSelectionFromSemanticModelAction } from "./remove-selection-from-semantic-model";
import { changeSemanticModelVisibilityAction } from "./change-semantic-model-visibility";
import { createNewVisualModelFromSelectionAction } from "./create-new-visual-model-from-selection";
import { addNodeNeighborhoodToVisualModelAction } from "./add-node-neighborhood-to-visual-model";
import { profileSelectionAction } from "./create-profile-of-selection";
import { filterInMemoryModels } from "../util/model-utils";
import { placePositionOnGrid } from "@dataspecer/layout";
import { addSemanticEntityToVisualModelAction } from "./add-semantic-entity-to-visual-model-action";

const LOG = createLogger(import.meta.url);

interface DialogActions {

  openCreateModelDialog: () => void;

  openDetailDialog: (identifier: string) => void;

  openModifyDialog: (identifier: string) => void;

  openCreateClassDialog: (model: string) => void;

  openCreateAssociationDialog: (model: string) => void;

  openCreateAttributeDialog: (model: string) => void;

  /**
   * @deprecated Use specialized method for given entity type.
   */
  openCreateProfileDialog: (identifier: string) => void;

}

interface VisualModelActions {

  addSemanticEntityToVisualModel: (identifier: string, position?: { x: number, y: number } | null) => void;

  addClassToVisualModel: (model: string, identifier: string, position: { x: number, y: number } | null) => void;

  addClassProfileToVisualModel: (model: string, identifier: string, position: { x: number, y: number } | null) => void;

  addGeneralizationToVisualModel: (model: string, identifier: string) => void;

  addRelationToVisualModel: (model: string, identifier: string) => void;

  addRelationProfileToVisualModel: (model: string, identifier: string) => void;

  removeFromVisualModel: (identifier: string) => void;

  //
  changeSelectionVisibility: (selection: string[], edgeSelection: string[], visibility: boolean) => void;

  deleteSelectionFromSemanticModel: (nodeSelection: string[], edgeSelection: string[]) => void;
  //

  createNewVisualModelFromSelection: (selection: string[], keepPositionsFromCurrentVisualModel: boolean) => void;

  //
  changeSemanticModelVisibility: (semanticModelIdentifier: string, visibility: boolean) => void;

  addNodeNeighborhoodToVisualModel: (nodeIdentifier: string) => void;

}

export interface ActionsContextType extends DialogActions, VisualModelActions {

  /**
   * TODO: Rename to delete entity as it removes from semantic model as well as from visual.
   */
  deleteFromSemanticModel: (model: string, identifier: string) => void;

  centerViewportToVisualEntity: (model: string, identifier: string) => void;

  /**
   * As this context requires two way communication it is created and shared via the actions.
   */
  diagram: UseDiagramType | null;

}

const noOperationActionsContext = {
  openCreateModelDialog: noOperation,
  openDetailDialog: noOperation,
  openModifyDialog: noOperation,
  openCreateClassDialog: noOperation,
  openCreateAssociationDialog: noOperation,
  openCreateAttributeDialog: noOperation,
  openCreateProfileDialog: noOperation,
  //
  addSemanticEntityToVisualModel: noOperation,
  addClassToVisualModel: noOperation,
  addClassProfileToVisualModel: noOperation,
  addGeneralizationToVisualModel: noOperation,
  addRelationToVisualModel: noOperation,
  addRelationProfileToVisualModel: noOperation,
  deleteFromSemanticModel: noOperation,
  //
  removeFromVisualModel: noOperation,
  centerViewportToVisualEntity: noOperation,
  //
  changeSelectionVisibility: noOperation,
  deleteSelectionFromSemanticModel: noOperation,

  //
  createNewVisualModelFromSelection: noOperation,

  //
  changeSemanticModelVisibility: noOperation,
  addNodeNeighborhoodToVisualModel: noOperation,
  diagram: null,
};

function noOperation() {
  LOG.error("[ACTIONS] Using uninitialized actions context!");
}

export const ActionContext = React.createContext<ActionsContextType>(noOperationActionsContext);

export const ActionsContextProvider = (props: {
  children: React.ReactNode,
}) => {
  const options = useOptions();
  const dialogs = useContext(DialogApiContext);
  const classes = useContext(ClassesContext);
  const useClasses = useClassesContext();
  const notifications = useNotificationServiceWriter();
  const graph = useContext(ModelGraphContext);
  const diagram = useDiagram();

  const actions = useMemo(
    () => createActionsContext(
      options, dialogs, classes, useClasses, notifications, graph, diagram),
    [options, dialogs, classes, useClasses, notifications, graph, diagram]
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
let prevUseClasses: UseClassesContextType | null = null;
let prevNotifications: UseNotificationServiceWriterType | null = null;
let prevGraph: ModelGraphContextType | null = null;
let prevDiagram: UseDiagramType | null = null;

function createActionsContext(
  options: Options | null,
  dialogs: DialogApiContextType | null,
  classes: ClassesContextType | null,
  useClasses: UseClassesContextType | null,
  notifications: UseNotificationServiceWriterType | null,
  graph: ModelGraphContextType | null,
  diagram: UseDiagramType,
): ActionsContextType {

  if (options === null || dialogs === null || classes === null ||
    useClasses == null || notifications === null || graph === null ||
    !diagram.areActionsReady) {
    // We need to return the diagram object so it can be consumed by
    // the Diagram component and initialized.
    return {
      ...noOperationActionsContext,
      diagram,
    };
  }

  // Monitoring before we get all the dependencies fixed.
  const changed = [];
  if (prevOptions !== options) changed.push("options");
  if (prevDialogs !== dialogs) changed.push("dialogs");
  if (prevClasses !== classes) changed.push("classes");
  if (prevUseClasses !== useClasses) changed.push("prevUseClasses");
  if (prevNotifications !== notifications) changed.push("notifications");
  if (prevGraph !== graph) changed.push("graph");
  if (prevDiagram !== diagram) changed.push("diagram");
  console.info("[ACTIONS] Creating new context object. ", { changed });
  prevOptions = options;
  prevDialogs = dialogs;
  prevClasses = classes;
  prevUseClasses = useClasses;
  prevNotifications = notifications;
  prevGraph = graph;
  prevDiagram = diagram;
  //

  const openCreateProfileDialog = (identifier: string) => {
    withVisualModel(notifications, graph, (visualModel) => {
      const position = getViewportCenter(diagram);
      openCreateProfileDialogAction(
        options, dialogs, notifications, classes, useClasses, graph,
        visualModel, diagram, position, identifier);
    });
  };

  const openCreateConnectionDialog = (source: string, target: string) => {
    withVisualModel(notifications, graph, (visualModel) => {
      openCreateConnectionDialogAction(
        options, dialogs, notifications, useClasses, graph,
        visualModel, source, target);
    });
  };

  const deleteVisualElement = (identifier: string) => {
    const model = findSourceModelOfEntity(identifier, graph.models);
    if (model === null) {
      notifications.error("Can't find model for entity.");
      return;
    }
    removeFromVisualModelAction(notifications, graph, identifier);
    removeFromSemanticModelAction(notifications, graph, model.getId(), identifier);
  };

  const changeNodesPositions = (changes: { [identifier: string]: Position }) => {
    withVisualModel(notifications, graph, (visualModel) => {
      for (const [identifier, position] of Object.entries(changes)) {
        visualModel.updateVisualEntity(identifier, { position });
      }
    });
  };

  const addWaypoint = (edge: Edge, index: number, waypoint: DiagramWaypoint) => {
    withVisualModel(notifications, graph, (visualModel) => {
      const visualEdge = visualModel.getVisualEntity(edge.identifier);
      if (visualEdge === null) {
        notifications.error("Ignore waypoint update of non-existing visual entity.")
        return;
      }
      if (isVisualRelationship(visualEdge) || isVisualProfileRelationship(visualEdge)) {
        const waypoints: Waypoint[] = [
          ...visualEdge.waypoints.slice(0, index),
          { x: waypoint.x, y: waypoint.y, anchored: null },
          ...visualEdge.waypoints.slice(index),
        ];
        visualModel.updateVisualEntity(edge.identifier, { waypoints });
      } else {
        notifications.error("Ignore waypoint update of non-edge visual type.")
      }
    });
  }

  const deleteWaypoint = (edge: Edge, index: number) => {
    withVisualModel(notifications, graph, (visualModel) => {
      const visualEdge = visualModel.getVisualEntity(edge.identifier);
      if (visualEdge === null) {
        notifications.error("Ignore waypoint update of non-existing visual entity.")
        return;
      }
      if (isVisualRelationship(visualEdge) || isVisualProfileRelationship(visualEdge)) {
        const waypoints: Waypoint[] = [
          ...visualEdge.waypoints.slice(0, index),
          ...visualEdge.waypoints.slice(index + 1),
        ];
        visualModel.updateVisualEntity(edge.identifier, { waypoints });
      } else {
        notifications.error("Ignore waypoint update of non-edge visual type.")
      }
    });
  }

  const changeWaypointPositions = (changes: { [edgeIdentifier: string]: { [waypointIndex: number]: DiagramWaypoint } }) => {
    withVisualModel(notifications, graph, (visualModel) => {
      for (const [identifier, waypointsChanges] of Object.entries(changes)) {
        const visualEdge = visualModel.getVisualEntity(identifier);
        if (visualEdge === null) {
          notifications.error("Ignore waypoint update of non-existing visual entity.")
          return;
        }
        if (isVisualRelationship(visualEdge) || isVisualProfileRelationship(visualEdge)) {
          const waypoints: Waypoint[] = [...visualEdge.waypoints];
          for (const [index, waypoint] of Object.entries(waypointsChanges)) {
            waypoints[Number(index)] = { ...waypoints[Number(index)], x: waypoint.x, y: waypoint.y };
          }
          console.log("onChangeWaypointPositions", { changes: changes, prev: visualEdge.waypoints, next: waypoints });
          visualModel.updateVisualEntity(identifier, { waypoints });
        } else {
          notifications.error("Ignore waypoint update of non-edge visual type.")
        }
      }
    });
  }

  // Dialog actions.

  const openCreateModelDialog = () => {
    openCreateVocabularyAction(dialogs, graph);
  };

  const openDetailDialog = (identifier: string) => {
    openDetailDialogAction(options, dialogs, notifications, graph, identifier);
  };

  const openModifyDialog = (identifier: string) => {
    openModifyDialogAction(
      options, dialogs, notifications, classes, useClasses, graph, identifier);
  };

  const openCreateClassDialog = (model: string) => {
    const visualModel = graph.aggregatorView.getActiveVisualModel();
    const modelInstance = graph.models.get(model);
    if (modelInstance === null || modelInstance instanceof InMemorySemanticModel) {
      openCreateClassDialogAction(
        options, dialogs, classes, graph, notifications, visualModel,
        diagram, modelInstance, null);
    } else {
      notifications.error("Can not add to given model.");
    }
  };

  const openCreateAssociationDialog = (model: string) => {
    const visualModel = graph.aggregatorView.getActiveVisualModel();
    const modelInstance = graph.models.get(model);
    if (modelInstance === null || modelInstance instanceof InMemorySemanticModel) {
      openCreateAssociationDialogAction(
        options, dialogs, classes, graph, notifications, visualModel,
        modelInstance);
    } else {
      notifications.error("Can not add to given model.");
    }
  };

  const openCreateAttributeDialog = (model: string) => {
    const visualModel = graph.aggregatorView.getActiveVisualModel();
    const modelInstance = graph.models.get(model);
    if (modelInstance === null || modelInstance instanceof InMemorySemanticModel) {
      openCreateAttributeDialogAction(
        options, dialogs, classes, graph, notifications, visualModel,
        modelInstance);
    } else {
      notifications.error("Can not add to given model.");
    }
  };

  // Visual model actions.

  const addSemanticEntityToVisualModel = (identifier: string, position?: { x: number, y: number } | null): void => {
    withVisualModel(notifications, graph, (visualModel) => {
      addSemanticEntityToVisualModelAction(
        notifications, graph, visualModel, diagram, identifier, position ?? null);
    });
  };

  const addClassToVisualModel = (model: string, identifier: string, position: { x: number, y: number } | null): void => {
    withVisualModel(notifications, graph, (visualModel) => {
      addSemanticClassToVisualModelAction(
        notifications, graph, visualModel, diagram, identifier, model, position);
    });
  };

  const addClassProfileToVisualModel = (model: string, identifier: string, position: { x: number, y: number } | null): void => {
    withVisualModel(notifications, graph, (visualModel) => {
      addSemanticClassProfileToVisualModelAction(
        notifications, graph, visualModel, diagram, identifier, model, position);
    });
  }

  const addGeneralizationToVisualModel = (model: string, identifier: string): void => {
    withVisualModel(notifications, graph, (visualModel) => {
      addSemanticGeneralizationToVisualModelAction(
        notifications, graph, visualModel, identifier, model);
    });
  }

  const addRelationToVisualModel = (model: string, identifier: string): void => {
    withVisualModel(notifications, graph, (visualModel) => {
      addSemanticRelationshipToVisualModelAction(
        notifications, graph, visualModel, identifier, model);
    });
  };

  const addRelationProfileToVisualModel = (model: string, identifier: string): void => {
    withVisualModel(notifications, graph, (visualModel) => {
      addSemanticRelationshipProfileToVisualModelAction(
        notifications, graph, visualModel, identifier, model);
    });
  };

  const removeFromVisualModel = (identifier: string): void => {
    removeFromVisualModelAction(notifications, graph, identifier);
  };

  // ...

  const deleteFromSemanticModel = (model: string, identifier: string) => {
    // We start be removing from the visual model.
    removeFromVisualModelAction(notifications, graph, identifier);
    removeFromSemanticModelAction(notifications, graph, model, identifier);
  };

  const centerViewportToVisualEntity = (model: string, identifier: string) => {
    centerViewportToVisualEntityAction(notifications, graph, diagram, model, identifier);
  };

  const changeSelectionVisibility = (selection: string[], edgeSelection: string[], visibility: boolean) => {
    changeSelectionVisibilityAction(selection, edgeSelection, notifications, graph, visibility);
  };

  const deleteSelectionFromSemanticModel = (nodeSelection: string[], edgeSelection: string[]) => {
    removeSelectionFromSemanticModelAction(nodeSelection, edgeSelection, notifications, graph);
  };

  const changeSemanticModelVisibility = (semanticModelIdentifier: string, visibility: boolean) => {
    changeSemanticModelVisibilityAction(semanticModelIdentifier, graph, notifications, visibility);
  };

  const addNodeNeighborhoodToVisualModel = (nodeIdentifier: string) => {
    addNodeNeighborhoodToVisualModelAction(nodeIdentifier, graph, notifications);
  };

  const createNewVisualModelFromSelection = (selectionIdentifiers: string[], keepPositionsFromCurrentVisualModel: boolean) => {
    createNewVisualModelFromSelectionAction(selectionIdentifiers, keepPositionsFromCurrentVisualModel, graph, notifications);
  };

  // Prepare and set diagram callbacks.

  const callbacks: DiagramCallbacks = {

    onShowNodeDetail: (node) => openDetailDialog(node.externalIdentifier),

    onEditNode: (node) => openModifyDialog(node.externalIdentifier),

    onCreateNodeProfile: (node) => openCreateProfileDialog(node.externalIdentifier),

    onHideNode: (node) => removeFromVisualModel(node.externalIdentifier),

    onDeleteNode: (node) => deleteVisualElement(node.externalIdentifier),

    onChangeNodesPositions: changeNodesPositions,

    onShowEdgeDetail: (node) => openDetailDialog(node.externalIdentifier),

    onEditEdge: (edge) => openModifyDialog(edge.externalIdentifier),

    onCreateEdgeProfile: (edge) => openCreateProfileDialog(edge.externalIdentifier),

    onHideEdge: (edge) => removeFromVisualModel(edge.externalIdentifier),

    onDeleteEdge: (edge) => deleteVisualElement(edge.externalIdentifier),

    onAddWaypoint: addWaypoint,

    onDeleteWaypoint: deleteWaypoint,

    onChangeWaypointPositions: changeWaypointPositions,

    onCreateConnectionToNode: (source, target) => {
      openCreateConnectionDialog(source.externalIdentifier, target.externalIdentifier);
    },

    onCreateConnectionToNothing: (source, positionRelativeToViewport, flowPosition) => {
      console.log("Application.onCreateConnectionToNothing", { source, positionRelativeToViewport, flowPosition });
      diagram.actions().openCanvasToolbar(source, positionRelativeToViewport, flowPosition, "EDGE-DRAG-CANVAS-MENU-TOOLBAR");
    },

    onSelectionDidChange: (nodes, edges) => {
      console.log("Application.onSelectionDidChange", { nodes, edges });
    },
    onAnchorNode: (diagramNode) => {
      alert("Anchoring node");
    },
    onShowSelectionActions: (source, positionRelativeToViewport, flowPosition) => {
      console.log("Application.onShowSelectionActions", { source, positionRelativeToViewport, flowPosition });
      diagram.actions().openCanvasToolbar(source, positionRelativeToViewport, flowPosition, "NODE-SECONDARY-TOOLBAR");
    },
    onLayoutSelection: () => {
      alert("TODO: currently does nothing (In future - Layouting selection)");
    },
    onCreateGroup: () => {
      alert("TODO: currently does nothing (In future - Creating group)");
    },
    onShowExpandSelection: () => {
      alert("TODO: currently does nothing (In future - Showing expansion dialog)");
    },
    onShowFilterSelection: () => {
      alert("TODO: currently does nothing (In future - Showing filter dialog)");
    },
    onCanvasOpenCreateClassDialog: (sourceClassNode, positionToPlaceClassOn) => {
      // TODO: Maybe should be action - openCreateClassDialogWithModelDerivedFromClass

      let model = findSourceModelOfEntity(sourceClassNode.externalIdentifier, graph.models);
      if (model === null || !(model instanceof InMemorySemanticModel)) {
        // Take the first model in memory model ... It is done the same way in create connection dialog
        // TODO: Note that this causes crash, if there is no InMemorySemanticModel at all - I will make issue
        filterInMemoryModels([...graph.models.values()])[0];
        model = filterInMemoryModels([...graph.models.values()])?.[0] ?? null;
      }

      if (model === null) {
        notifications.error("Can't find InMemorySemanticModel to put the association in");
        return;
      }

      placePositionOnGrid(positionToPlaceClassOn, configuration().xSnapGrid, configuration().ySnapGrid);

      // TODO: The way of creating dialog changed

      // const onConfirm = (state: CreateClassDialogState) => {
      //   createClassAction(notifications, graph, model as InMemorySemanticModel, positionToPlaceClassOn, state);
      //   // If (Only If!) we want to add in the option to open CreateConnection dialog right after then we need 2 things:
      //   //            1) Get the result of createClassAction. There are 2 ways to do this.
      //   //                    a) Wait for dialog to finish here, but we also need to get the result and the "classes" variable is not updated, so we would have to get result somehow
      //   //                    b) Pass in callback
      //   //            2) Currently when we open new dialog here it is not opened - The issue is because when the current dialog (so CreateEditClass) is closed it also closes
      //   //               all the following which are to be put in the stack - the problem is that we are not using the old state but just setting the new one
      // };

      // dialogs?.openDialog(createEditClassDialog(model, options.language, onConfirm));

      withVisualModel(notifications, graph, (visualModel) => {
        openCreateClassDialogAction(options, dialogs, classes, graph, notifications, visualModel, diagram, model as InMemorySemanticModel, positionToPlaceClassOn);
      });
    },
    onCreateNewViewFromSelection: () => {
      const nodeSelection = diagram.actions().getSelectedNodes().map(node => node.externalIdentifier);
      const edgeSelection = diagram.actions().getSelectedEdges().map(edge => edge.externalIdentifier);
      alert("The view functionality currently doesn't work");
      diagram.actions().closeCanvasToolbar();
    },
    onProfileSelection: () => {
      const nodeSelection = diagram.actions().getSelectedNodes().map(node => node.externalIdentifier);
      const edgeSelection = diagram.actions().getSelectedEdges().map(edge => edge.externalIdentifier);
      withVisualModel(notifications, graph, (visualModel) => {
        profileSelectionAction(nodeSelection, edgeSelection, classes, graph, visualModel, diagram, notifications, options);
      });
      diagram.actions().closeCanvasToolbar();
    },
    onHideSelection: () => {
      const nodeSelection = diagram.actions().getSelectedNodes().map(node => node.externalIdentifier);
      const edgeSelection = diagram.actions().getSelectedEdges().map(edge => edge.externalIdentifier);
      console.info("Removing selection from view: ", [nodeSelection]);
      changeSelectionVisibilityAction(nodeSelection, edgeSelection, notifications, graph, false);
      diagram.actions().closeCanvasToolbar();
    },
    onDeleteSelection: () => {
      const nodeSelection = diagram.actions().getSelectedNodes().map(node => node.externalIdentifier);
      const edgeSelection = diagram.actions().getSelectedEdges().map(edge => edge.externalIdentifier);
      console.info("Removing selection from view: ", [nodeSelection]);
      removeSelectionFromSemanticModelAction(nodeSelection, edgeSelection, notifications, graph);
      diagram.actions().closeCanvasToolbar();
    },
  };

  diagram.setCallbacks(callbacks);

  return {
    openCreateModelDialog,
    openDetailDialog,
    openModifyDialog,
    openCreateClassDialog,
    openCreateAssociationDialog,
    openCreateAttributeDialog,
    openCreateProfileDialog,
    //
    addSemanticEntityToVisualModel,
    addClassToVisualModel,
    addClassProfileToVisualModel,
    addGeneralizationToVisualModel,
    addRelationToVisualModel,
    addRelationProfileToVisualModel,
    removeFromVisualModel,
    //
    deleteFromSemanticModel,
    centerViewportToVisualEntity,

    changeSelectionVisibility,
    deleteSelectionFromSemanticModel,
    createNewVisualModelFromSelection,
    changeSemanticModelVisibility,
    addNodeNeighborhoodToVisualModel,

    diagram,
  };

}

function withVisualModel(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  callback: (visualModel: WritableVisualModel) => void,
): void {
  const visualModel = graph.aggregatorView.getActiveVisualModel();
  if (visualModel === null) {
    notifications.error("There is no active visual model.");
    return;
  }
  if (!isWritableVisualModel(visualModel)) {
    notifications.error("Visual model is not writable.");
    return;
  }
  callback(visualModel);
}

export const useActions = (): ActionsContextType => {
  return useContext(ActionContext);
};
