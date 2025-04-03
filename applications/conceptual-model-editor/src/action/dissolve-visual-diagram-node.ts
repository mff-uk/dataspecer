import { isVisualDiagramNode,
  isVisualEdgeEnd,
  isVisualGroup,
  isVisualModel,
  isVisualNode,
  isVisualProfileRelationship,
  isVisualRelationship,
  VisualEdgeEndPoint,
  VisualEntity,
  VisualModel,
  VisualRelationship,
  WritableVisualModel
} from "@dataspecer/core-v2/visual-model";
import { VisualModelDiagramNode } from "@/diagram";
import { ModelGraphContextType } from "@/context/model-context";
import { UseNotificationServiceWriterType } from "@/notification/notification-service-context";
import { XY } from "@dataspecer/layout";
import { addVisualNode } from "@/dataspecer/visual-model/operation/add-visual-node";
import { UseDiagramType } from "@/diagram/diagram-hook";
import { addVisualDiagramNode } from "@/dataspecer/visual-model/operation/add-visual-diagram-node";
import { getClassesAndDiagramNodesModelsFromVisualModelRecursively } from "./utilities";
import { ClassesContextType } from "@/context/classes-context";
import { getDomainAndRangeConceptsIncludingGeneralizations } from "@/util/relationship-utils";
import {
  SemanticModelClass,
  SemanticModelGeneralization,
  SemanticModelRelationship
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
  SemanticModelClassProfile,
  SemanticModelRelationshipProfile
} from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { addToRecordArray } from "@/utilities/functional";

export function dissolveVisualDiagramNodeAction(
  notifications: UseNotificationServiceWriterType,
  classesContext: ClassesContextType,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  visualModel: WritableVisualModel,
  diagramNode: VisualModelDiagramNode,
): void {
  const referencedVisualModel = graph.visualModels.get(diagramNode.externalIdentifier);
  if(referencedVisualModel === undefined) {
    notifications.error("The referenced visual model does not exist");
    return;
  }
  if(!isVisualModel(referencedVisualModel)) {
    notifications.error("The referenced visual model is not a visual model");
    return;
  }

  const availableVisualModels = graph.aggregatorView.getAvailableVisualModels();

  copyVisualEntitiesBetweenModels(
    notifications, classesContext, diagram, availableVisualModels,
    referencedVisualModel, visualModel, diagramNode.position, diagramNode);

  // Ideally we would implement the rerouting for visual profile relationships somewhere down in this file,
  // but the validation in visual model handles it for us. So that seems like extra work, which is not really that trivial.
  refreshVisualModel(graph);
}

function refreshVisualModel (graph: ModelGraphContextType) {
  graph.setAggregatorView(graph.aggregator.getView());
}

function copyVisualEntitiesBetweenModels(
  notifications: UseNotificationServiceWriterType,
  classesContext: ClassesContextType,
  diagram: UseDiagramType,
  availableVisualModels: VisualModel[],
  copyFrom: VisualModel,
  copyTo: WritableVisualModel,
  centerPositionInNewModel: XY,
  diagramNodeWhichCausedTheCopy: VisualModelDiagramNode | null,
) {
  const visualEntitiesToMove = copyFrom.getVisualEntities();
  const nodes = [...visualEntitiesToMove.values()].filter(isVisualEdgeEnd);
  console.info("visualEntitesToMove", {visualEntitesToMove: visualEntitiesToMove, nodes});
  if (nodes.length === 0) {
    return;
  }

  const topLeft = getTopLeftPosition(nodes);
  const botRight = getBotRightPosition(nodes, diagram);
  const width = botRight.x - topLeft.x;
  const height = botRight.y - topLeft.y;
  const middle = {
    x: topLeft.x + width / 2,
    y: topLeft.y + height / 2
  };
  const positionShift: XY = {
    x: middle.x - centerPositionInNewModel.x,
    y: middle.y - centerPositionInNewModel.y
  };

  moveExistingEntitiesInVisualModel(copyTo, middle, width, height);
  const originalToCopyMap = addCopiesToVisualModel(notifications, copyTo, nodes, positionShift, visualEntitiesToMove);
  if(diagramNodeWhichCausedTheCopy === null) {
    return;
  }

  rerouteEdgesFromVisualDiagramNodeToItsContent(
    notifications, classesContext, availableVisualModels,
    diagramNodeWhichCausedTheCopy.identifier, copyTo, copyFrom, originalToCopyMap);
}

function moveExistingEntitiesInVisualModel(
  visualModel: WritableVisualModel,
  center: XY,
  width: number,
  height: number,
) {
  const existingVisualEntities = visualModel.getVisualEntities();
  const nodes = [...existingVisualEntities.values()].filter(isVisualEdgeEnd);
  const expansionRectangle: Rectangle = {
    center,
    width,
    height
  };
  for (const node of nodes) {
    const dx = node.position.x - center.x;
    const dy = node.position.y - center.y;
    const distanceFromCenter = computeDistance(dx, dy);
    const newPosition = moveNodeAlongEdgeToRectangle(node.position, center, expansionRectangle, distanceFromCenter);

    visualModel.updateVisualEntity(node.identifier, {
      position: {
        x: newPosition.x,
        y: newPosition.y,
        anchored: node.position.anchored
      }
    });
  }

}

////////////////////////////////////////////////
// Generated by ChatGPT - ... TODO RadStr: Doesn't seem to work correctly
// TODO RadStr: Either fix it or try to wrap the ndoes to fake group an run nodeOverlapRemoval algorithm with value = 10
//              ... Just do the one which is less work

type Rectangle = {
  center: XY;
  width: number;
  height: number;
};

function computeDistance(dx: number, dy: number) {
  return Math.sqrt(dx * dx + dy * dy);
}

function moveNodeAlongEdgeToRectangle(
  node: XY,
  anchor: XY,
  rectangle: Rectangle,
  distance: number
): XY {
  // Compute the direction vector from anchor to node
  const dx = node.x - anchor.x;
  const dy = node.y - anchor.y;

  // Compute the magnitude of the vector
  const magnitude = computeDistance(dx, dy);

  // Normalize the vector (unit direction)
  const unitX = dx / magnitude;
  const unitY = dy / magnitude;

  // Compute the half-size of the rectangle
  const halfWidth = rectangle.width / 2;
  const halfHeight = rectangle.height / 2;

  // Determine the bounds of the rectangle
  const minX = rectangle.center.x - halfWidth;
  const maxX = rectangle.center.x + halfWidth;
  const minY = rectangle.center.y - halfHeight;
  const maxY = rectangle.center.y + halfHeight;

  // Find potential intersections with vertical and horizontal edges
  const tX = (unitX > 0) ? (maxX - anchor.x) / unitX : (minX - anchor.x) / unitX;
  const tY = (unitY > 0) ? (maxY - anchor.y) / unitY : (minY - anchor.y) / unitY;

  const boundaryX = anchor.x + unitX * tX;
  const boundaryY = anchor.y + unitY * tY;

  // Move the node along the edge direction by the given distance from the rectangle boundary
  return {
    x: boundaryX + unitX * distance,
    y: boundaryY + unitY * distance,
  };
}

////////////////////////////////////////////////

/**
 *
 * @param notifications
 * @param classesContext
 * @param diagramNodeToReroute
 * @param visualModelContainingDiagramNode
 * @param modelReferencedByDiagramNode
 * @param originalToCopyMap maps the identifiers of the {@link modelReferencedByDiagramNode} to the new identifiers in {@link visualModelContainingDiagramNode}
 */
function rerouteEdgesFromVisualDiagramNodeToItsContent(
  notifications: UseNotificationServiceWriterType,
  classesContext: ClassesContextType,
  availableVisualModels: VisualModel[],
  diagramNodeToReroute: string,
  visualModelContainingDiagramNode: WritableVisualModel,
  modelReferencedByDiagramNode: VisualModel,
  originalToCopyMap: Record<string, string>,
) {
  // 1) Get all visual entities in diagram node
  // 2) iterate through all the possible candidates for rerouting
  // 3) Check if it should point directly to the class or visual diagram node, which is inside

  const allClasses = [
    ...classesContext.classes,
    ...classesContext.classProfiles,
  ];
  const allRelationships = [
    ...classesContext.relationships,
    ...classesContext.relationshipProfiles,
    ...classesContext.generalizations,
  ];

  const visualRelationshipsToIteratorMap: Record<string, number> = {};

  const sourceModelVisualEntities = visualModelContainingDiagramNode.getVisualEntities();
  for(const visualEntity of sourceModelVisualEntities.values()) {
    if(isVisualRelationship(visualEntity)) {
      if(visualRelationshipsToIteratorMap[visualEntity.representedRelationship] === undefined) {
        visualRelationshipsToIteratorMap[visualEntity.representedRelationship] = 0;
      }

      if(visualEntity.visualSource === diagramNodeToReroute) {
        const newEnd = rerouteToEntityInsideDiagramNode(
          notifications, allClasses, allRelationships, availableVisualModels,
          visualModelContainingDiagramNode, modelReferencedByDiagramNode, visualEntity,
          visualRelationshipsToIteratorMap, visualEntity.visualTarget, EdgeEndDirection.Source);
        if(newEnd === null) {
          visualModelContainingDiagramNode.deleteVisualEntity(visualEntity.identifier);
          continue;
        }

        const newIdentifier = originalToCopyMap[newEnd];
        visualModelContainingDiagramNode.updateVisualEntity(visualEntity.identifier, {visualSource: newIdentifier});
      }
      else if(visualEntity.visualTarget === diagramNodeToReroute) {
        // Same code but with source instead
        const newEnd = rerouteToEntityInsideDiagramNode(
          notifications, allClasses, allRelationships, availableVisualModels,
          visualModelContainingDiagramNode, modelReferencedByDiagramNode, visualEntity,
          visualRelationshipsToIteratorMap, visualEntity.visualSource, EdgeEndDirection.Target);
        if(newEnd === null) {
          visualModelContainingDiagramNode.deleteVisualEntity(visualEntity.identifier);
          continue;
        }

        const newIdentifier = originalToCopyMap[newEnd];

        visualModelContainingDiagramNode.updateVisualEntity(visualEntity.identifier, {visualTarget: newIdentifier});
      }
    }
    else if(isVisualProfileRelationship(visualEntity)) {
      // It is handled by visual model refresh.
      // Ideally perform similiar stuff as for the visual relationships.
      // Then we would not need to refresh the model
    }
  }
}

enum EdgeEndDirection {
  Source,
  Target
}

/**
 * @param visualRelationshipsToIteratorMap Maps the semantic relationship to the amount of time it was visited
 */
function rerouteToEntityInsideDiagramNode(
  notifications: UseNotificationServiceWriterType,
  allClasses: (SemanticModelClass | SemanticModelClassProfile)[],
  allRelationships: (SemanticModelRelationship | SemanticModelRelationshipProfile | SemanticModelGeneralization)[],
  allAvailableVisualModels: VisualModel[],
  visualModelWithDiagramNode: VisualModel,
  referencedVisualModel: VisualModel,
  visualRelationship: VisualRelationship,
  visualRelationshipsToIteratorMap: Record<string, number>,
  otherEndOfTheVisualRelationship: string,
  visualDiagramNodeDirection: EdgeEndDirection
): string | null {
  const representedRelationship = allRelationships
    .find(relationship => relationship.id === visualRelationship.representedRelationship);
  if(representedRelationship === undefined) {
    notifications.error("Missing represented entity when rerouting visual relationship with end in the diagram node");
    return null;
  }

  const otherEnd = visualModelWithDiagramNode.getVisualEntity(otherEndOfTheVisualRelationship);
  if(otherEnd === null) {
    notifications.error("Missing the node on the other end when rerouting visual relationship with end in the diagram node");
    return null;
  }

  const domainAndRange = getDomainAndRangeConceptsIncludingGeneralizations(representedRelationship);
  let otherSemanticEndIdentifier: string | null;
  if(visualDiagramNodeDirection === EdgeEndDirection.Source) {
    otherSemanticEndIdentifier = domainAndRange.domain;
  }
  else {
    otherSemanticEndIdentifier = domainAndRange.range;
  }

  if (otherSemanticEndIdentifier === null) {
    console.error("Can't find the identifier of the other end, we don't report the result in notifications, since it may be valid");
    return null;
  }

  const otherSemanticEnd = allClasses.find(cclass => cclass.id === otherSemanticEndIdentifier);
  if (otherSemanticEnd === undefined) {
    notifications.error("The other end is not present in semantic model, something is wrong");
    return null;
  }

  // TODO RadStr: Maybe I dont even need the otherSemanticEnd

  const directReroutingCandidates = referencedVisualModel.getVisualEntitiesForRepresented(otherSemanticEndIdentifier);
  if(directReroutingCandidates.length > 0) {
    const visitCount = visualRelationshipsToIteratorMap[visualRelationship.representedRelationship];
    const index = visitCount % directReroutingCandidates.length;
    visualRelationshipsToIteratorMap[visualRelationship.representedRelationship]++;
    return directReroutingCandidates[index].identifier;
  }
  else {
    for (const visualEntity of Object.values(referencedVisualModel.getVisualEntities())) {
      if(isVisualDiagramNode(visualEntity)) {
        const classes = getClassesAndDiagramNodesModelsFromVisualModelRecursively(
          allAvailableVisualModels, visualEntity.representedVisualModel);
        if(classes.findIndex(cclass => cclass === otherSemanticEndIdentifier) >= 0) {
          return visualEntity.identifier;
        }
      }
    }
  }

  return null;
}

function addCopiesToVisualModel(
  notifications: UseNotificationServiceWriterType,
  copyTo: WritableVisualModel,
  nodesToCopy: VisualEdgeEndPoint[],
  positionShift: XY,
  visualEntitiesToCopy: Map<string, VisualEntity>
): Record<string, string> {
  const originalToCopyMap: Record<string, string> = {};

  for (const node of nodesToCopy) {
    const position = {...node.position};
    position.x -= positionShift.x;
    position.y -= positionShift.y;
    if(isVisualNode(node)) {
      const identifier = addVisualNode(copyTo, {id: node.representedEntity}, node.model, position, [...node.content]);
      originalToCopyMap[node.identifier] = identifier;
    }
    else if(isVisualDiagramNode(node)) {
      const identifier = addVisualDiagramNode(
        copyTo, node.label, node.description, node.position, node.representedVisualModel);
      originalToCopyMap[node.identifier] = identifier
    }
    else {
      notifications.error("The moved edge endpoint is of unknown type");
    }
  }

  for (const [_id, visualEntity] of visualEntitiesToCopy) {
    if(isVisualRelationship(visualEntity)) {
      const waypoints = [...visualEntity.waypoints];
      waypoints.forEach(waypoint => {
        waypoint.x -= positionShift.x;
        waypoint.y -= positionShift.y;
      });

      copyTo.addVisualRelationship({
        model: visualEntity.model,
        representedRelationship: visualEntity.representedRelationship,
        waypoints,
        visualSource: originalToCopyMap[visualEntity.visualSource],
        visualTarget: originalToCopyMap[visualEntity.visualTarget],
      });
    }
    else if(isVisualProfileRelationship(visualEntity)) {
      const waypoints = [...visualEntity.waypoints];
      waypoints.forEach(waypoint => {
        waypoint.x -= positionShift.x;
        waypoint.y -= positionShift.y;
      });
      copyTo.addVisualProfileRelationship({
        model: visualEntity.model,
        entity: visualEntity.entity,
        waypoints,
        visualSource: originalToCopyMap[visualEntity.visualSource],
        visualTarget: originalToCopyMap[visualEntity.visualTarget],
      });
    }
    else if(isVisualGroup(visualEntity)) {
      copyTo.addVisualGroup({
        anchored: visualEntity.anchored,
        content: [...visualEntity.content],
      });
    }
    else {
      // Already processed
      continue;
    }
  }

  return originalToCopyMap;
}

const getTopLeftPosition = (nodes: VisualEdgeEndPoint[]) => {
  const topLeft = {
    x: 10000000,
    y: 10000000
  };
  nodes.forEach(node => {
    if(node.position.x < topLeft.x) {
      topLeft.x = node.position.x;
    }
    if(node.position.y < topLeft.y) {
      topLeft.y = node.position.y;
    }
  });

  return topLeft;
};

const getBotRightPosition = (
  nodes: VisualEdgeEndPoint[],
  diagram: UseDiagramType
) => {
  const botRight = {
    x: -10000000,
    y: -10000000
  };
  nodes.forEach(node => {
    const x = node.position.x + (diagram.actions().getNodeWidth(node.identifier) ?? 0);
    if(x > botRight.x) {
      botRight.x = x;
    }
    const y = node.position.y + (diagram.actions().getNodeHeight(node.identifier) ?? 0);
    if(y > botRight.y) {
      botRight.y = y;
    }
  });

  return botRight;
};
