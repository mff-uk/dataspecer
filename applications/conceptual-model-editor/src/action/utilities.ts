import { Entity, EntityModel } from "@dataspecer/core-v2";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";

import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { configuration, createLogger } from "../application";
import { placePositionOnGrid, ReactflowDimensionsConstantEstimator, XY } from "@dataspecer/layout";
import { isVisualNode, isVisualRelationship, Position, VisualModel, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { Edge, EdgeType, Node } from "../diagram";
import { findSourceModelOfEntity } from "../service/model-service";
import { ModelGraphContextType } from "../context/model-context";
import { ClassesContextType } from "../context/classes-context";
import { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";

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

export function setSelectionsInDiagram(selectionsToSetWith: Selections, diagram: UseDiagramType) {
    diagram.actions().setSelectedNodes(selectionsToSetWith.nodeSelection);
    diagram.actions().setSelectedEdges(selectionsToSetWith.edgeSelection);
}

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
 * @returns The barycenter of nodes associated to {@link nodeToFindAssociationsFor} and boolean variable saying if the position was explicitly put to middle of viewport.
 */
export const computeMiddleOfRelatedAssociationsPositionAction = (
    nodeToFindAssociationsFor: string,
    notifications: UseNotificationServiceWriterType,
    visualModel: WritableVisualModel,
    diagram: UseDiagramType,
    classesContext: ClassesContextType
): ComputedPositionForNodePlacement => {
    // TODO RadStr: !!!! Use this commented code after merge with systematic selection, this is just so I have something which works for this branch
    // const associatedClasses: string[] = findAssociatedClassesAndClassUsages(nodeToFindAssociationsFor);
    const associatedClasses: string[] = findAssociatedClasses(nodeToFindAssociationsFor, classesContext.classes, classesContext.relationships).map(classs => classs.id);
    const associatedPositions = associatedClasses.map(associatedClassIdentifier => {
        const visualNode = visualModel.getVisualEntityForRepresented(associatedClassIdentifier);
        if(visualNode === null) {
            return null;
        }
        if(!isVisualNode(visualNode)) {
            notifications.error("One of the associated nodes is actually not a node for unknown reason");
            return null;
        }

        return visualNode.position;
    }).filter(position => position !== null);

    const barycenter = computeBarycenter(associatedPositions.filter(pos => pos !== undefined), diagram);
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



// TODO RadStr: !!! After merge with systematic selection -
//                  We can replace all of the following methods using the following commented code !!!

// export const findAssociatedClassesAndClassUsages = (nodeToFindAssociationsFor: string) => {
//     // TODO: Actually if the passed semantic models are null, then the function isn't async
//     const selection = extendSelection([nodeToFindAssociationsFor], ["ASSOCIATION"], "ONLY-VISIBLE", null);
//     return selection;
// }


//////
// Helper methods

/**
 * @deprecated Will be replaced by systematic selection
 */
type ZeroOrOne = 0 | 1;

/**
 * @deprecated Will be replaced by systematic selection
 */
const getSecondEnd = (end: ZeroOrOne) => {
    return 1 - end;
};

/**
 * @deprecated Will be replaced by systematic selection
 */
const checkForAssociatedClass = (id: string, end: ZeroOrOne, classes: SemanticModelClass[], relationship: SemanticModelRelationship) => {
    if(relationship.ends[end]?.concept === id && relationship.ends[getSecondEnd(end)]?.concept !== null) {
        return classes.find(cclass => cclass.id === relationship.ends[getSecondEnd(end)]?.concept);
    }
    else {
        return null;
    }
};

/**
 * @deprecated Will be replaced by systematic selection
 */
const findAssociatedClasses = (id: string, classes: SemanticModelClass[],
                                relationships: SemanticModelRelationship[]): SemanticModelClass[] => {
    const theClass = classes.find(cclass => cclass.id === id);
    if(theClass === undefined) {
        return [];
    }

    const associatedClasses = relationships.map(relationship => {
        const firstCandidate = checkForAssociatedClass(id, 0, classes, relationship);
        if(firstCandidate !== null) {
            return firstCandidate;
        }

        const secondCandidate = checkForAssociatedClass(id, 1, classes, relationship);
        if(secondCandidate !== null) {
            return secondCandidate;
        }

        return null;
    }).filter(cclass => cclass !== null && cclass !== undefined);

    return associatedClasses;
};
p);
        if(secondCandidate !== null) {
            return secondCandidate;
        }

        return null;
    }).filter(cclass => cclass !== null && cclass !== undefined);

    return associatedClasses;
};
>>>>>>> cme-feature/node-placement-to-neighborhood-PR
