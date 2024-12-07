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
import { filterOutProfileClassEdges, getSelections, getViewportCenterForClassPlacement } from "./utilities";
import { removeFromVisualModelAction } from "./remove-from-visual-model";
import { removeFromSemanticModelAction } from "./remove-from-semantic-model";
import { openCreateAttributeDialogAction } from "./open-create-attribute-dialog";
import { openCreateAssociationDialogAction } from "./open-create-association-dialog";
import { removeSelectionFromSemanticModelAction } from "./remove-selection-from-semantic-model";
import { addEntitiesFromSemanticModelToVisualModelAction } from "./add-entities-from-semantic-model-to-visual-model";
import { createNewVisualModelFromSelectionAction } from "./create-new-visual-model-from-selection";
import { addClassNeighborhoodToVisualModelAction } from "./add-class-neighborhood-to-visual-model";
import { createDefaultProfilesAction } from "./create-default-profiles";
import { openCreateClassDialogWithModelDerivedFromClassAction } from "./open-create-class-dialog-with-derived-model";
import { addSemanticEntitiesToVisualModelAction, EntityToAddToVisualModel } from "./add-semantic-entities-to-visual-model";

const LOG = createLogger(import.meta.url);

/**
 * Contains actions used for dialog manipulation.
 */
interface DialogActions {

  /**
   * Opens dialog, which purpose is to add new model into editor.
   */
  openCreateModelDialog: () => void;

  /**
   * Opens dialog, which purpose is to show the detail information of entity identified by {@link identifier}.
   * @param identifier is the identifier of the semantic entity.
   */
  openDetailDialog: (identifier: string) => void;

  /**
   * Opens dialog, which purpose is to modification of entity identified by {@link identifier}.
   * @param identifier is the identifier of the semantic entity.
   */
  openModifyDialog: (identifier: string) => void;

  /**
   * Opens dialog, which purpose is to create new class in model identified by {@link model}.
   * @param model is the identifier of the semantic model.
   */
  openCreateClassDialog: (model: string) => void;

  /**
   * Opens dialog, which purpose is to create new association in model identified by {@link model}.
   * @param model is the identifier of the semantic model.
   */
  openCreateAssociationDialog: (model: string) => void;

  /**
   * Opens dialog, which purpose is to create new attribute in model identified by {@link model}.
   * @param model is the identifier of the semantic model.
   */
  openCreateAttributeDialog: (model: string) => void;

  /**
   * @deprecated Use specialized method for given entity type.
   */
  openCreateProfileDialog: (identifier: string) => void;

}


/**
 * Contains actions used for manipulation with visual model .
 */
interface VisualModelActions {
// TODO PRQuestion: How should we document these action methods? Since their implementation is usually
//                  within the .*Action methods defined in different files in this directory.
//                  So should the actual documentation look like: For further information about the action see {@link ...Action} method.
//                  Can be seen on the centerViewportToVisualEntity method, where the Action method is already documented


  /**
   * Adds semantic entities identified by identifier to currently active visual model at optional position.
   * @param entities are the semantic entities to be added to visual model. For further info check the docs of {@link EntityToAddToVisualModel}
   */
  addSemanticEntitiesToVisualModel: (entities: EntityToAddToVisualModel[]) => void;

  /**
   * Adds semantic class identified by {@link identifier} to currently active visual model at given {@link position}.
   * @param model identifies the semantic (TODO PRQuestion: Just double checking if it is semantic and not visual) model, where the semantic entity resides.
   * @param identifier identifies the semantic class to be added to visual model.
   * @param position is the position to put the newly created visual node at.
   * If the position is null then default placement is chosen.
   */
  addClassToVisualModel: (model: string, identifier: string, position: { x: number, y: number } | null) => void;

  /**
   * Adds semantic class profile identified by {@link identifier} to currently active visual model at given {@link position}.
   * @param model identifies the semantic model, where the semantic entity resides.
   * @param identifier identifies the semantic class profile to be added to visual model.
   * @param position is the position to put the newly created visual node at.
   * If the position is null then default placement is chosen.
   */
  addClassProfileToVisualModel: (model: string, identifier: string, position: { x: number, y: number } | null) => void;

  /**
   * Adds generalization identified by {@link identifier} to currently active visual model at given {@link position}.
   * @param model identifies the semantic model, where the semantic entity resides.
   * @param identifier identifies the generalization to be added to visual model.
   */
  addGeneralizationToVisualModel: (model: string, identifier: string) => void;

  /**
   * Adds relation (association) identified by {@link identifier} to currently active visual model at given {@link position}.
   * @param model identifies the semantic model, where the semantic entity resides.
   * @param identifier identifies the relation to be added to visual model.
   */
  addRelationToVisualModel: (model: string, identifier: string) => void;

  /**
   * Adds relation (association) profile identified by {@link identifier} to currently active visual model at given {@link position}.
   * @param model identifies the semantic model, where the semantic entity resides.
   * @param identifier identifies the relation profile to be added to visual model.
   */
  addRelationProfileToVisualModel: (model: string, identifier: string) => void;

  // TODO PRQuestion - different docs from this method and for the actual action
  /**
   * Removes the visual entities identified by given {@link identifier} from visual model.
   * Also removes related visual relationships from the visual model.
   * @param identifiers identify the SEMANTIC entities, which visual representations will be removed from visual model.
   */
  removeFromVisualModel: (identifiers: string[]) => void;

  //
  // TODO RadStr: Document after rewrite
  deleteSelectionFromSemanticModel: (nodeSelection: string[], edgeSelection: string[]) => void;
  //
  // TODO RadStr: We will see what will this do, maybe will be openDialog instead, where we provide options as mentioned in code review by PeSk:
  //              I would even imagine that this would open the dialog where user can provide:
  //              - name of the new model
  //              - whether to copy model colors
  //              - whether to keep position (relative / absolute)
  createNewVisualModelFromSelection: (selectionIdentifiers: string[]) => void;

  //
  // TODO RadStr: Document after rewrite
  addEntitiesFromSemanticModelToVisualModel: (semanticModelIdentifier: string) => void;

  /**
   * Puts class' neighborhood to visual model. That is classes connected to semantic class or class profile identified by {@link classIdentifier}.
   * @param identifier is the identifier of the semantic class or class profile, whose neighborhood we will add to visual model.
   */
  addClassNeighborhoodToVisualModel: (identifier: string) => void;

}


/**
 * Contains actions, which are stored in the context for further use.
 */
export interface ActionsContextType extends DialogActions, VisualModelActions {

  /**
   * TODO: Rename to delete entity as it removes from semantic model as well as from visual.
   */
  deleteFromSemanticModel: (model: string, identifier: string) => void;

  // TODO RadStr: Document based on PRQuestion
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
  addSemanticEntitiesToVisualModel: noOperation,
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
  deleteSelectionFromSemanticModel: noOperation,

  //
  createNewVisualModelFromSelection: noOperation,

  //
  addEntitiesFromSemanticModelToVisualModel: noOperation,
  addClassNeighborhoodToVisualModel: noOperation,
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
      const position = getViewportCenterForClassPlacement(diagram);
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

  // TODO PRQuestion: Rewrite so it works with identifierS instead?
  //                  ... Probably just do it, not really a question
  const deleteVisualElement = (identifier: string) => {
    const model = findSourceModelOfEntity(identifier, graph.models);
    if (model === null) {
      notifications.error("Can't find model for entity.");
      return;
    }
    withVisualModel(notifications, graph, (visualModel) => {
      removeFromVisualModelAction(notifications, visualModel, [identifier]);
    });
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

  const addSemanticEntitiesToVisualModel = (entities: EntityToAddToVisualModel[]): void => {
    withVisualModel(notifications, graph, (visualModel) => {
      addSemanticEntitiesToVisualModelAction(
        notifications, graph, visualModel, diagram, entities);
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

  const removeFromVisualModel = (identifiers: string[]): void => {
    withVisualModel(notifications, graph, (visualModel) => {
      removeFromVisualModelAction(notifications, visualModel, identifiers);
    });
  };

  // ...

  const deleteFromSemanticModel = (model: string, identifier: string) => {
    // We start be removing from the visual model.
    withVisualModel(notifications, graph, (visualModel) => {
      removeFromVisualModelAction(notifications, visualModel, [identifier]);
    });
    removeFromSemanticModelAction(notifications, graph, model, identifier);
  };

  const centerViewportToVisualEntity = (model: string, identifier: string) => {
    centerViewportToVisualEntityAction(notifications, graph, diagram, model, identifier);
  };

  const deleteSelectionFromSemanticModel = (nodeSelection: string[], edgeSelection: string[]) => {
    removeSelectionFromSemanticModelAction(notifications, graph, nodeSelection, edgeSelection);
  };

  const addEntitiesFromSemanticModelToVisualModel = (semanticModelIdentifier: string) => {
    addEntitiesFromSemanticModelToVisualModelAction(notifications, graph, semanticModelIdentifier);
  };

  const addClassNeighborhoodToVisualModel = (identifier: string) => {
    addClassNeighborhoodToVisualModelAction(graph, notifications, identifier);
  };

  const createNewVisualModelFromSelection = (selectionIdentifiers: string[]) => {
    createNewVisualModelFromSelectionAction(notifications, graph, selectionIdentifiers);
  };

  // Prepare and set diagram callbacks.

  const callbacks: DiagramCallbacks = {

    onShowNodeDetail: (node) => openDetailDialog(node.externalIdentifier),

    onEditNode: (node) => openModifyDialog(node.externalIdentifier),

    onCreateNodeProfile: (node) => openCreateProfileDialog(node.externalIdentifier),

    onHideNode: (node) => removeFromVisualModel([node.externalIdentifier]),

    onDeleteNode: (node) => deleteVisualElement(node.externalIdentifier),

    onChangeNodesPositions: changeNodesPositions,

    onShowEdgeDetail: (node) => openDetailDialog(node.externalIdentifier),

    onEditEdge: (edge) => openModifyDialog(edge.externalIdentifier),

    onCreateEdgeProfile: (edge) => openCreateProfileDialog(edge.externalIdentifier),

    onHideEdge: (edge) => removeFromVisualModel([edge.externalIdentifier]),

    onDeleteEdge: (edge) => deleteVisualElement(edge.externalIdentifier),

    onAddWaypoint: addWaypoint,

    onDeleteWaypoint: deleteWaypoint,

    onChangeWaypointPositions: changeWaypointPositions,

    onCreateConnectionToNode: (source, target) => {
      openCreateConnectionDialog(source.externalIdentifier, target.externalIdentifier);
    },

    onCreateConnectionToNothing: (source, canvasPosition) => {
      console.log("Application.onCreateConnectionToNothing", { source, canvasPosition });
      diagram.actions().openCanvasToolbar(source, canvasPosition, "EDGE-DRAG-CANVAS-MENU-TOOLBAR");
    },

    onSelectionDidChange: (nodes, edges) => {
      console.log("Application.onSelectionDidChange", { nodes, edges });
    },
    onToggleAnchorForNode: (diagramNode) => {
      // TODO RadStr: - Functionality of toggling node anchor on/off is currently unavailable
    },
    onShowSelectionActions: (source, canvasPosition) => {
      console.log("Application.onShowSelectionActions", { source, canvasPosition });
      diagram.actions().openCanvasToolbar(source, canvasPosition, "NODE-SELECTION-ACTIONS-SECONDARY-TOOLBAR");
    },
    onLayoutSelection: () => {
      // TODO RadStr: Currently does nothing (In future - Opens layouting menu - 3 buttons - alignments + layouting)
    },
    onCreateGroup: () => {
      // TODO RadStr: Currently does nothing (In future - Creating group)
    },
    onShowExpandSelection: () => {
      // TODO RadStr: currently does nothing (In future - Showing expansion dialog)
    },
    onShowFilterSelection: () => {
      // TODO RadStr: currently does nothing (In future - Showing filter dialog)
    },
    onCanvasOpenCreateClassDialog: (sourceClassNode, positionToPlaceClassOn) => {
      withVisualModel(notifications, graph, (visualModel) => {
        openCreateClassDialogWithModelDerivedFromClassAction(notifications, graph, dialogs, classes, options, diagram, visualModel, sourceClassNode, positionToPlaceClassOn);
      });
    },
    onCreateNewViewFromSelection: () => {
      const {nodeSelection, edgeSelection} = getSelections(diagram, true, false);
      alert("The view functionality currently doesn't work");
      createNewVisualModelFromSelection(nodeSelection.concat(edgeSelection));
    },
    onProfileSelection: () => {
      const {nodeSelection, edgeSelection} = getSelections(diagram, true, false);
      withVisualModel(notifications, graph, (visualModel) => {
        createDefaultProfilesAction(notifications, graph, diagram, options, classes, visualModel, nodeSelection, edgeSelection, true);
      });
    },
    onHideSelection: () => {
      const {nodeSelection, edgeSelection} = getSelections(diagram, true, false);
      console.info("Hiding selection from view: ", {nodeSelection, edgeSelection});
      removeFromVisualModel(nodeSelection.concat(edgeSelection));
    },
    onDeleteSelection: () => {
      const {nodeSelection, edgeSelection} = getSelections(diagram, true, false);
      console.info("Removing selection from semantic model: ", {nodeSelection, edgeSelection});
      removeSelectionFromSemanticModelAction(notifications, graph, nodeSelection, edgeSelection);
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
    addSemanticEntitiesToVisualModel,
    addClassToVisualModel,
    addClassProfileToVisualModel,
    addGeneralizationToVisualModel,
    addRelationToVisualModel,
    addRelationProfileToVisualModel,
    removeFromVisualModel,
    //
    deleteFromSemanticModel,
    centerViewportToVisualEntity,

    deleteSelectionFromSemanticModel,
    createNewVisualModelFromSelection,
    addEntitiesFromSemanticModelToVisualModel,
    addClassNeighborhoodToVisualModel,

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
