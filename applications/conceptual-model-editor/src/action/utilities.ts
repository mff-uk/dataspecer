import { Entity, EntityModel } from "@dataspecer/core-v2";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";

import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { configuration, createLogger } from "../application";
import { ReactflowDimensionsConstantEstimator, XY, placePositionOnGrid } from "@dataspecer/layout";
import { Position, VisualGroup, VisualModel, WritableVisualModel, isVisualNode, isVisualGroup, isVisualRelationship, VisualDiagramNode, VisualNode, isVisualDiagramNode, VisualEntity } from "@dataspecer/core-v2/visual-model";
import { DiagramNodeTypes, Edge, EdgeType } from "../diagram";
import { findSourceModelOfEntity } from "../service/model-service";
import { ModelGraphContextType } from "../context/model-context";
import { ClassesContextType } from "../context/classes-context";
import { ExtensionType, VisibilityFilter, extendSelectionAction } from "./extend-selection-action";
import { Selections } from "./filter-selection-action";
import { isSemanticModelAttribute } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelAttributeUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { addToRecordArray } from "@/utilities/functional";

const LOG = createLogger(import.meta.url);

export type EntityToDelete = {
  sourceModel: string,
  identifier: string,
};

export function convertToEntitiesToDeleteType(
  notifications: UseNotificationServiceWriterType | null,
  allModels: Map<string, EntityModel>,
  entityIdentifiers: string[],
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
 * The nodes representing visual models have visual identifier of the represented model as an external identifier.
 */
export function getSelections(
  diagram: UseDiagramType,
  shouldFilterOutProfileClassEdges: boolean,
  shouldGetVisualIdentifiers: boolean,
): Selections {
  const nodeSelectionFromDiagram = diagram.actions().getSelectedNodes();
  let edgeSelectionFromDiagram = diagram.actions().getSelectedEdges();

  if(shouldFilterOutProfileClassEdges) {
    edgeSelectionFromDiagram = edgeSelectionFromDiagram.filter(edge => edge.type !== EdgeType.ClassProfile);
  }

  let nodeSelection = extractIdentifiers(nodeSelectionFromDiagram, shouldGetVisualIdentifiers);
  let edgeSelection = extractIdentifiers(edgeSelectionFromDiagram, shouldGetVisualIdentifiers);
  if(!shouldGetVisualIdentifiers) {
    // There may be duplicates, we have to remove them
    nodeSelection = [...new Set(nodeSelection)];
    edgeSelection = [...new Set(edgeSelection)];
  }
  return {
    nodeSelection,
    edgeSelection
  };
}

function getMapFunctionToExtractIdentifier(shouldGetVisualIdentifiers: boolean) {
  return shouldGetVisualIdentifiers ?
    ((entity: DiagramNodeTypes | Edge) => entity.identifier) :
    ((entity: DiagramNodeTypes | Edge) => entity.externalIdentifier);
}

export function extractIdentifiers(
  arrayToExtractFrom: DiagramNodeTypes[] | Edge[],
  shouldGetVisualIdentifiers: boolean
) {
  const identifierMap = getMapFunctionToExtractIdentifier(shouldGetVisualIdentifiers);
  return arrayToExtractFrom.map(identifierMap);
}

export function filterOutProfileClassEdges(edgeSemanticIdentifiers: string[], visualModel: VisualModel): string[] {
  return edgeSemanticIdentifiers.filter(edgeIdentifier => {
    const visualEntity = visualModel.getVisualEntitiesForRepresented(edgeIdentifier)[0];
    return visualEntity !== undefined && isVisualRelationship(visualEntity);
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
export const computeRelatedAssociationsBarycenterAction = async (
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  diagram: UseDiagramType,
  classesContext: ClassesContextType,
  classToFindAssociationsFor: string,
): Promise<ComputedPositionForNodePlacement> => {
  const associatedClasses: string[] = (await findAssociatedClassesAndClassProfiles(
    notifications, graph, classesContext, classToFindAssociationsFor)).selectionExtension.nodeSelection;
  const associatedPositions = associatedClasses.flatMap(associatedNodeIdentifier => {
    const visualEntities = visualModel.getVisualEntitiesForRepresented(associatedNodeIdentifier);
    if(visualEntities.length === 0) {
      notifications.error("The associated visual entity is not present in visual model, even though it should");
      return null;
    }
    const positions = [];
    for(const visualEntity of visualEntities) {
      if(!isVisualNode(visualEntity)) {
        notifications.error("One of the associated nodes is actually not a node for unknown reason");
        return null;
      }
      positions.push(visualEntity.position);
    }

    return positions.length > 0 ? positions : null;
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
  }, { x: 0, y: 0, anchored: null });

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

// TODO RadStr: Put in ExtensionType.ClassProfile, but not now since it does not work
//              See https://github.com/mff-uk/dataspecer/issues/966
const findAssociatedClassesAndClassProfiles = async (
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  classesContext: ClassesContextType,
  classToFindAssociationsFor: string
) => {
  // Is synchronous for this case
  const selection = await extendSelectionAction(notifications, graph, classesContext,
    { areIdentifiersFromVisualModel: false, identifiers: [classToFindAssociationsFor] },
    [ExtensionType.Association, ExtensionType.Generalization],
    VisibilityFilter.OnlyVisibleNodes, false, null);
  return selection;
}

// TODO RadStr: Add tests for stuff in this file! (just to the exported stuff)

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

/**
 * Finds the top level group for given {@link identifier}, which represents any kind of node
 * (node, group, visual diagram node). We are looking for top level group in the given {@link visualModel}
 * @returns The identifier of the top level group or null, if the input node identified by {@link identifier} isn't part of any group.
 */
export function findTopLevelGroupInVisualModel(
  identifier: string,
  visualModel: VisualModel,
): string | null {
  const { existingGroups, nodeToGroupMapping } = getGroupMappings(visualModel);
  const topLevelGroup = findTopLevelGroup(identifier, existingGroups, nodeToGroupMapping);
  return topLevelGroup;
}

/**
 * Returns all visual diagram node mappings in the given model. We are mapping classes to parent visual diagram nodes.
 * That is for each diagram node all the nodes and diagram nodes contained in it are returned.
 * To be exact the {@link classToVisualDiagramNodeMappingRaw} in result returns for each class
 * all the possible parent visual diagram nodes it is part of.
 * It also contains the mappings of visual diagram nodes to its parent visual diagram node.
 * So keys are both visual and semantic identifiers, but it is simpler to use, if we have it all in one map.
 * The {@link existingVisualDiagramNodes} returns the diagram nodes stored in given {@link visualModel}
 * @returns The {@link classToVisualDiagramNodeMapping} contains the mapped visual diagram nodes together with the amount,
 * {@link classToVisualDiagramNodeMappingRaw} just contains all the visual diagram nodes
 *  (possibly multiple times if it the class is present in it more than once)
 */
export function getVisualDiagramNodeMappingsByRepresented(
  availableVisualModels: VisualModel[],
  visualModel: VisualModel
): {
  existingVisualDiagramNodes: Record<string, VisualDiagramNode>,
  classToVisualDiagramNodeMapping: Record<string, Record<string, number>>,
  classToVisualDiagramNodeMappingRaw: Record<string, string[]>
 } {
  const existingVisualDiagramNodes: Record<string, VisualDiagramNode> = {};
  const classToVisualDiagramNodeMappingRaw: Record<string, string[]> = {};
  for (const [identifier, visualEntity] of visualModel.getVisualEntities()) {
    if (isVisualDiagramNode(visualEntity)) {
      existingVisualDiagramNodes[identifier] = visualEntity;
      const containedNodes = getClassesAndDiagramNodesModelsFromVisualModelRecursively(
        availableVisualModels, visualEntity.representedVisualModel);
      for (const containedNode of containedNodes) {
        addToRecordArray(containedNode, identifier, classToVisualDiagramNodeMappingRaw);
      }
    }
  }

  const classToVisualDiagramNodeMapping: Record<string, Record<string, number>> = {};
  for (const [cclass, diagramNodes] of Object.entries(classToVisualDiagramNodeMappingRaw)) {
    for (const diagramNode of diagramNodes) {
      if (classToVisualDiagramNodeMapping[cclass] === undefined) {
        classToVisualDiagramNodeMapping[cclass] = {};
      }
      if (classToVisualDiagramNodeMapping[cclass][diagramNode] === undefined) {
        classToVisualDiagramNodeMapping[cclass][diagramNode] = 0;
      }
      classToVisualDiagramNodeMapping[cclass][diagramNode]++;
    }
  }

  return {
    existingVisualDiagramNodes,
    classToVisualDiagramNodeMapping,
    classToVisualDiagramNodeMappingRaw,
  };
}

/**
 * @returns Returns the mapping of all kind of nodes to group to which they belong in given {@link visualModel}.
 */
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

/**
 * @returns Returns object, which contains the "removed" entities, i.e. the entities
 * which were present in the {@link previousValues}, but are not present in {@link nextValues}.
 * and "added", which are present in {@link nextValues}, but were not present in {@link previousValues}.
 */
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
 * Type representing visual entities, which can be visual end of visual edge.
 */
export type VisualEdgeEndPoint = VisualDiagramNode | VisualNode;

/**
 * @returns True if the given {@link what} is visual entity, which can be visual end of edge.
 * Currently that is either {@link VisualNode} or node representing diagram ({@link VisualDiagramNode}).
 */
export function isVisualEdgeEnd(what: VisualEntity): what is VisualEdgeEndPoint {
  return isVisualNode(what) || isVisualDiagramNode(what);
}

/**
 * @returns The semantic identifiers of the nodes in visual model.
 *          BUT it is important to note that links of visual diagram nodes are followed.
 *          The reason for this is quite simple - we can not work with visual identifiers
 *          from different models and since visual diagram nodes are visual entities without
 *          semantic counter-part, returning semantic identifiers is the only logical solution.
 *          The visual diagram nodes are also contained in the output - those have the represented model's identifier
 */
export function getClassesAndDiagramNodesModelsFromVisualModelRecursively(
  availableVisualModels: VisualModel[],
  visualModel: string,
) {
  return getClassesAndDiagramNodesFromVisualModelInternal(
    availableVisualModels, visualModel, []);
}

function getClassesAndDiagramNodesFromVisualModelInternal(
  availableVisualModels: VisualModel[],
  visualModel: string,
  result: string[],
) {
  const linkedVisualmodel = availableVisualModels.find(availableVisualModel => visualModel === availableVisualModel.getIdentifier());
  if(linkedVisualmodel !== undefined) {
    for (const [_, visualEntity] of linkedVisualmodel.getVisualEntities()) {
      if(isVisualNode(visualEntity)) {
        result.push(visualEntity.representedEntity);
      }
      else if(isVisualDiagramNode(visualEntity)) {
        result.push(visualEntity.representedVisualModel);
        getClassesAndDiagramNodesFromVisualModelInternal(availableVisualModels, visualEntity.representedVisualModel, result);
      }
    }
  }

  return result;
}