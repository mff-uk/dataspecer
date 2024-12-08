import { Entity, EntityModel } from "@dataspecer/core-v2";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";

import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { configuration, createLogger } from "../application";
import { placePositionOnGrid, ReactflowDimensionsConstantEstimator } from "@dataspecer/layout";
import { isVisualRelationship, VisualModel } from "@dataspecer/core-v2/visual-model";
import { Edge, EdgeType, Node } from "../diagram";
import { findSourceModelOfEntity } from "../service/model-service";

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

  position.x -= ReactflowDimensionsConstantEstimator.getDefaultWidth() / 2;
  position.y -= ReactflowDimensionsConstantEstimator.getDefaultHeight() / 2;
  placePositionOnGrid(position, configuration().xSnapGrid, configuration().ySnapGrid);

  return position;
}


// TODO RadStr: This exact type is defined in another branch so unify in future
// TODO RadStr: Also use the other type defined in the other branch which has additional information about type of IDs
//              (visual or semantic)
type Selections = {
  nodeSelection: string[],
  edgeSelection: string[],
};

export function getSelections(diagram: UseDiagramType, shouldFilterOutProfileClassEdges: boolean, shouldGetVisualIdentifiers: boolean): Selections {
  let nodeSelection = diagram.actions().getSelectedNodes();
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


// TODO RadStr: Maybe this method should be called every time when working with edge selection?
//              Right now I don't see any case when we want to work with the edges representing class profile (except for setting waypoints)
export function filterOutProfileClassEdges(edgeSemanticIdentifiers: string[], visualModel: VisualModel): string[] {
  return edgeSemanticIdentifiers.filter(edgeIdentifier => {
    const visualEntity = visualModel.getVisualEntityForRepresented(edgeIdentifier);
    return visualEntity !== null && isVisualRelationship(visualEntity);
  });
}
