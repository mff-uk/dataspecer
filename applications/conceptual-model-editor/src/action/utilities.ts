import { Entity, EntityModel } from "@dataspecer/core-v2";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";

import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { configuration, createLogger } from "../application";
import { ReactflowDimensionsConstantEstimator, XY, placePositionOnGrid } from "@dataspecer/layout";
import { Position, VisualGroup, VisualModel, WritableVisualModel, isVisualNode, isVisualGroup, isVisualRelationship, VisualSuperNode, VisualEntity, isVisualSuperNode, VISUAL_SUPER_NODE_TYPE, VisualRelationship, VisualProfileRelationship } from "@dataspecer/core-v2/visual-model";
import { DiagramNodeTypes, Edge, EdgeType, Node } from "../diagram";
import { findSourceModelOfEntity } from "../service/model-service";
import { ModelGraphContextType } from "../context/model-context";
import { ClassesContextType } from "../context/classes-context";
import { ExtensionType, VisibilityFilter, extendSelectionAction } from "./extend-selection-action";
import { Selections } from "./filter-selection-action";
import { isSemanticModelAttribute } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelAttributeUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

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

export function checkIfIsAttributeOrAttributeProfile(
  entityIdentifier: string,
  allModels: Map<string, EntityModel>,
  sourceModelIdentifier: string
) {
  const entity = allModels.get(sourceModelIdentifier)?.getEntities()?.[entityIdentifier] ?? null;
  const isAttributeOrAttributeProfile = isSemanticModelAttribute(entity) || isSemanticModelAttributeUsage(entity);
  return isAttributeOrAttributeProfile;
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

/**
 * @returns Current selection in diagram, which has data formatted based on function arguments.
 * The super nodes have visual identifier as an external identifier.
 */
export function getSelections(
  diagram: UseDiagramType,
  shouldFilterOutProfileClassEdges: boolean,
  shouldGetVisualIdentifiers: boolean,
): Selections {
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
    ((entity: DiagramNodeTypes | Edge) => entity.identifier) :
    ((entity: DiagramNodeTypes | Edge) => entity.externalIdentifier);
}

export function extractIdentifiers(arrayToExtractFrom: DiagramNodeTypes[] | Edge[], shouldGetVisualIdentifiers: boolean) {
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

/**
 * @returns The top level group, or null if the node is not part of any group.
 * Note that if {@link identifier} is id of group, then that id is returned if it is top level group.
 */
export function findTopLevelGroup<T>(
  identifier: string,
  existingGroups: Record<string, T>,
  nodeToGroupMapping: Record<string, string>,
): string | null {
  if(nodeToGroupMapping[identifier] === undefined) {
    return existingGroups[identifier] === undefined ? null : identifier;
  }

  let topLevelGroup = nodeToGroupMapping[identifier];
  while(nodeToGroupMapping[topLevelGroup] !== undefined) {
    topLevelGroup = nodeToGroupMapping[topLevelGroup];
  }
  return topLevelGroup;
}

export function findTopLevelGroupFromVisualModel(
  identifier: string,
  visualModel: VisualModel,
): string | null {
  const { existingGroups, nodeToGroupMapping } = getGroupMappings(visualModel);
  const topLevelGroup = findTopLevelGroup(identifier, existingGroups, nodeToGroupMapping);
  return topLevelGroup;
}

/**
 * Returns all super node mappings in the given model.
 * That is for each super node all the nodes and super nodes contained in it are returned.
 * (Both the contained supernode and the content of the contained supernode is in the map).
 * The existingSuperNodes returns the super nodes stored in given {@link visualModel}
 */
export function getSuperNodeMappings(
  availableVisualModels: VisualModel[],
  visualModel: VisualModel
) {
  const existingSuperNodes: Record<string, VisualSuperNode> = {};
  const nodeToSuperNodeMapping: Record<string, string> = {};
  for(const [identifier, visualEntity] of visualModel.getVisualEntities()) {
    if(isVisualSuperNode(visualEntity)) {
      existingSuperNodes[identifier] = visualEntity;
      const containedNodes = getNodesAndSuperNodesFromVisualModelRecursively(
        availableVisualModels, visualEntity.visualModels[0]);
      for(const containedNode of containedNodes) {
        nodeToSuperNodeMapping[containedNode] = identifier;
      }
    }
  }

  return {
    existingSuperNodes,
    nodeToSuperNodeMapping,
  };
}

export function getGroupMappings(visualModel: VisualModel) {
  const existingGroups: Record<string, VisualGroup> = {};
  const nodeToGroupMapping: Record<string, string> = {};
  for(const [identifier, group] of visualModel.getVisualEntities()) {
    if(isVisualGroup(group)) {
      existingGroups[identifier] = group;
      for(const nodeInGroup of group.content) {
        nodeToGroupMapping[nodeInGroup] = identifier;
      }
    }
  }

  return {
    existingGroups,
    nodeToGroupMapping,
  };
}

export function getRemovedAndAdded<T>(previousValues: T[], nextValues: T[]) {
  const removed: T[] = [];
  const added: T[] = [];
  for(const element of nextValues) {
    const isElementInPrevious = previousValues.includes(element);
    if(!isElementInPrevious) {
      added.push(element);
    }
  }
  for(const element of previousValues) {
    const isElementInNext = nextValues.includes(element);
    if(!isElementInNext) {
      removed.push(element);
    }
  }

  return {
    removed,
    added
  };
}

/**
 * @returns The semantic identifiers of the nodes in visual model.
 *          BUT it is important to note that links of super nodes are followed.
 *          The reason for this is quite simple - we can not work with visual identifiers
 *          from different models and since super nodes are visual entities without
 *          semantic counter-part, this is the only logical solution.
 *          The super nodes are also contained in the output - those have the represented model's identifier
 */
export function getNodesAndSuperNodesFromVisualModelRecursively(
  availableVisualModels: VisualModel[],
  visualModel: string,
) {
  return getNodesAndSuperNodesFromVisualModelInternal(
    availableVisualModels, visualModel, []);
}


function getNodesAndSuperNodesFromVisualModelInternal(
  availableVisualModels: VisualModel[],
  visualModel: string,
  result: string[],
) {
  const linkedVisualmodel = availableVisualModels.find(availableVisualModel => visualModel === availableVisualModel.getIdentifier());
  if(linkedVisualmodel !== undefined) {
    for (let [_, visualEntity] of linkedVisualmodel.getVisualEntities()) {
      if(isVisualNode(visualEntity)) {
        result.push(visualEntity.representedEntity);
      }
      else if(isVisualSuperNode(visualEntity)) {
        result.push(visualEntity.visualModels[0]);
        getNodesAndSuperNodesFromVisualModelInternal(availableVisualModels, visualEntity.visualModels[0], result);
      }
    }
  }

  return result;
}



export function getVisualSourceAndTargetForEdge(
  visualModel: VisualModel,
  visualRelationship: VisualRelationship | VisualProfileRelationship,
  nodeToSuperNodeMapping: Record<string, string>,
) {
  const source = findVisualEndForEdge(visualModel, visualRelationship.visualSource, nodeToSuperNodeMapping);
  const target = findVisualEndForEdge(visualModel, visualRelationship.visualTarget, nodeToSuperNodeMapping);
  return {source, target};
}

function findVisualEndForEdge(
  visualModel: VisualModel,
  visualRelationshipEnd: string,
  nodeToSuperNodeMapping: Record<string, string>,
): string {
  const node = visualModel.getVisualEntity(visualRelationshipEnd);
  let visualEnd;
  if(node !== null) {
    if(isVisualNode(node)) {
      visualEnd = nodeToSuperNodeMapping[node.representedEntity] ?? visualRelationshipEnd;
    }
    else if(isVisualSuperNode(node)) {
      visualEnd = nodeToSuperNodeMapping[node.visualModels[0]] ?? visualRelationshipEnd;
    }
    else {
      LOG.error("Something bad happened, there was suppossed to be node, but it is some other visual entity");
      visualEnd = visualRelationshipEnd;
    }
  }
  else {
    visualEnd = visualRelationshipEnd;
  }

  return visualEnd;
}
