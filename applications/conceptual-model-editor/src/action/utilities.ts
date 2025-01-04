import { Entity, EntityModel } from "@dataspecer/core-v2";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";

import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { configuration, createLogger } from "../application";
import { ReactflowDimensionsConstantEstimator, XY, placePositionOnGrid } from "@dataspecer/layout";
import { Position, VisualModel, WritableVisualModel, isVisualNode, isVisualRelationship } from "@dataspecer/core-v2/visual-model";
import { Edge, EdgeType, Node } from "../diagram";
import { findSourceModelOfEntity } from "../service/model-service";
import { ModelGraphContextType } from "../context/model-context";
import { ClassesContextType } from "../context/classes-context";
import { ExtensionType, VisibilityFilter, extendSelectionAction } from "./extend-selection-action";
import { Selections } from "./filter-selection-action";

const LOG = createLogger(import.meta.url);

export type EntityToDelete = {
  sourceModel: string,
  identifier: string,
};

export function convertToEntitiesToDeleteType(
  entityIdentifiers: string[],
  allModels: Map<string, EntityModel>,
  notifications: UseNotificationServiceWriterType | null
): EntityToDelete[] {
  const entitiesToDelete: EntityToDelete[] = [];
  for(const entityIdentifier of entityIdentifiers) {
    const sourceModel = findSourceModelOfEntity(entityIdentifier, allModels);
    if(sourceModel === null) {
      if(notifications !== null) {
        notifications.error("Entity doesn't have source semantic model.");
      }
      continue;
    }
    entitiesToDelete.push({
      identifier: entityIdentifier,
      sourceModel: sourceModel.getId()
    });
  }
  return entitiesToDelete;
}

/**
 * Can handler with aggregated entity of given identifier and type.
 */
export function withAggregatedEntity<Type extends Entity>(
  notifications: UseNotificationServiceWriterType,
  entities: Record<string, AggregatedEntityWrapper>,
  entityIdentifier: string,
  _modelIdentifier: string,
  predicated: (entity: Entity) => entity is Type,
  handler: (entity: Type) => void,
) {
  const entity = entities[entityIdentifier].aggregatedEntity;
  if (entity === undefined || entity === null) {
    notifications.error("Missing semantic entity.");
    return;
  }
  if (!predicated(entity)) {
    notifications.error("Invalid entity type!");
    LOG.invalidEntity(entityIdentifier, "Entity is not of an expected type.", { entity });
    return;
  }
  handler(entity);
}

/**
 * Return center position of current viewport.
 */
export function getViewportCenter(diagram: UseDiagramType) {
  const viewport = diagram.actions().getViewport();
  return {
    x: viewport.position.x + (viewport.width / 2),
    y: viewport.position.y + (viewport.height / 2),
  };
}

/**
 * @returns Return slightly changed position of current viewport's center. The position is shifted so the class appears more in the middle.
 */
export function getViewportCenterForClassPlacement(diagram: UseDiagramType) {
  const position = getViewportCenter(diagram);

  position.x -= ReactflowDimensionsConstantEstimator.getMinimumWidth() / 2;
  position.y -= ReactflowDimensionsConstantEstimator.getDefaultHeight() / 2;
  placePositionOnGrid(position, configuration().xSnapGrid, configuration().ySnapGrid);

  return position;
}

/**
 *
 * @param selectionsToSetWith the {@link Selections} object with visual identifiers to be used as new selection.
 */
export function setSelectionsInDiagram(selectionsToSetWith: Selections, diagram: UseDiagramType) {
  diagram.actions().setSelectedNodes(selectionsToSetWith.nodeSelection);
  diagram.actions().setSelectedEdges(selectionsToSetWith.edgeSelection);
}

export function getSelections(diagram: UseDiagramType, shouldFilterOutProfileClassEdges: boolean, shouldGetVisualIdentifiers: boolean): Selections {
  const nodeSelection = diagram.actions().getSelectedNodes();
  let edgeSelection = diagram.actions().getSelectedEdges();

  if(shouldFilterOutProfileClassEdges) {
    edgeSelection = edgeSelection.filter(edge => edge.type !== EdgeType.ClassProfile);
  }

  return {
    nodeSelection: extractIdentifiers(nodeSelection, shouldGetVisualIdentifiers),
    edgeSelection: extractIdentifiers(edgeSelection, shouldGetVisualIdentifiers)
  };
}

function getMapFunctionToExtractIdentifier(shouldGetVisualIdentifiers: boolean) {
  return shouldGetVisualIdentifiers ?
    ((entity: Node | Edge) => entity.identifier) :
    ((entity: Node | Edge) => entity.externalIdentifier);
}

export function extractIdentifiers(arrayToExtractFrom: Node[] | Edge[], shouldGetVisualIdentifiers: boolean) {
  const identifierMap = getMapFunctionToExtractIdentifier(shouldGetVisualIdentifiers);
  return arrayToExtractFrom.map(identifierMap);
}

export function filterOutProfileClassEdges(edgeSemanticIdentifiers: string[], visualModel: VisualModel): string[] {
  return edgeSemanticIdentifiers.filter(edgeIdentifier => {
    const visualEntity = visualModel.getVisualEntityForRepresented(edgeIdentifier);
    return visualEntity !== null && isVisualRelationship(visualEntity);
  });
}

//
//

type ComputedPositionForNodePlacement = {
    position: XY,
    isInCenterOfViewport: boolean,
};

/**
 * @returns The barycenter of nodes associated to {@link classToFindAssociationsFor} and boolean variable saying if the position was explicitly put to middle of viewport.
 */
export const computeMiddleOfRelatedAssociationsPositionAction = async (
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  diagram: UseDiagramType,
  classesContext: ClassesContextType,
  classToFindAssociationsFor: string,
): Promise<ComputedPositionForNodePlacement> => {
  const associatedClasses: string[] = (await findAssociatedClassesAndClassUsages(notifications, graph, classesContext, classToFindAssociationsFor)).selectionExtension.nodeSelection;
  const associatedPositions = associatedClasses.map(associatedNodeIdentifier => {
    const visualNode = visualModel.getVisualEntityForRepresented(associatedNodeIdentifier);
    if(visualNode === null) {
      notifications.error("The associated visual entity is not present in visual model, even though it should");
      return null
    }
    if(!isVisualNode(visualNode)) {
      notifications.error("One of the associated nodes is actually not a node for unknown reason");
      return null;
    }

    return visualNode.position;
  }).filter(position => position !== null);

  const barycenter = computeBarycenter(associatedPositions, diagram);
  return barycenter;
};

/**
 * @returns The barycenter of given positions and boolean saying if the barycenter was put to middle of viewport, because there is 0 neighbors.
 */
const computeBarycenter = (positions: Position[], diagram: UseDiagramType): ComputedPositionForNodePlacement => {
  const barycenter = positions.reduce((accumulator: Position, currentValue: Position) => {
    accumulator.x += currentValue.x;
    accumulator.y += currentValue.y;

    return accumulator;
  }, {x: 0, y: 0, anchored: null});

  let isInCenterOfViewport;
  if(positions.length >= 1) {
    isInCenterOfViewport = false;
    barycenter.x /= positions.length;
    barycenter.y /= positions.length;
  }
  else {
    isInCenterOfViewport = true;
    const viewportMiddle = getViewportCenterForClassPlacement(diagram);
    barycenter.x = viewportMiddle.x;
    barycenter.y = viewportMiddle.y;
  }

  return {
    position: barycenter,
    isInCenterOfViewport
  };
};

const findAssociatedClassesAndClassUsages = async (
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  classesContext: ClassesContextType,
  classToFindAssociationsFor: string
) => {
  // Is synchronous for this case
  const selection = await extendSelectionAction(notifications, graph, classesContext,
    {areIdentifiersFromVisualModel: false, identifiers: [classToFindAssociationsFor]},
    [ExtensionType.ASSOCIATION, ExtensionType.GENERALIZATION], VisibilityFilter.ONLY_VISIBLE_NODES, false, null);
  return selection;
}