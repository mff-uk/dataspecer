import { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isVisualNode, Position } from "@dataspecer/core-v2/visual-model";
import { UseDiagramType } from "../diagram/diagram-hook";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ClassesContextType } from "../context/classes-context";
import { placePositionOnGrid, ReactflowDimensionsConstantEstimator, XY } from "@dataspecer/layout";
import { configuration } from "../application";


// TODO RadStr: After merge the content of this file should be in utilites.ts (and don't forget to remove getCenterOfViewport, respectively use the old variant without shifting)


export const getCenterOfViewport = (diagram: UseDiagramType) => {
    const viewport = diagram.actions().getViewport();

    const position = {
      x: viewport.position.x + (viewport.width / 2),
      y: viewport.position.y + (viewport.height / 2),
    };
    position.x -= ReactflowDimensionsConstantEstimator.getDefaultWidth() / 2;
    position.y -= ReactflowDimensionsConstantEstimator.getDefaultHeight() / 2;

    placePositionOnGrid(position, configuration().xSnapGrid, configuration().ySnapGrid);

    return position;
};

type ComputedPositionForNodePlacement = {
    position: XY,
    isInCenterOfViewport: boolean,
};

// TODO RadStr: Call this method using the withVisualModel method after we merge with main (it solves the issue of repeating the same error notifications for visual model)
/**
 * @returns The barycenter of nodes associated to {@link nodeToFindAssociationsFor} and boolean variable saying if the position was explicitly put to middle of viewport.
 */
export const computeMiddleOfRelatedAssociationsPositionAction = (
    nodeToFindAssociationsFor: string,
    notifications: UseNotificationServiceWriterType,
    graph: ModelGraphContextType,
    diagram: UseDiagramType,
    classesContext: ClassesContextType
): ComputedPositionForNodePlacement => {
    // TODO RadStr: !!!! Use this commented code after merge with systematic selection, this is just so I have something which works for this branch
    // const associatedClasses: string[] = findAssociatedClassesAndClassUsages(nodeToFindAssociationsFor);
    const associatedClasses: string[] = findAssociatedClasses(nodeToFindAssociationsFor, classesContext.classes, classesContext.relationships).map(classs => classs.id);

    const visualModel = graph.aggregatorView.getActiveVisualModel();
    if(visualModel === null) {
        notifications.error("There is no active visual model");
        return {
            position: getCenterOfViewport(diagram),
            isInCenterOfViewport: true,
        };
    }

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
        const viewportMiddle = getCenterOfViewport(diagram);
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
            console.warn("TODO: First");
            console.warn(firstCandidate);
            return firstCandidate;
        }

        const secondCandidate = checkForAssociatedClass(id, 1, classes, relationship);
        if(secondCandidate !== null) {
            console.warn("TODO: Second");
            console.warn(secondCandidate);
            return secondCandidate;
        }

        return null;
    }).filter(cclass => cclass !== null && cclass !== undefined);

    return associatedClasses;
};
