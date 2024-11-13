import { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isVisualNode, Position } from "@dataspecer/core-v2/visual-model";
import { UseDiagramType } from "../diagram/diagram-hook";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ClassesContextType } from "../context/classes-context";



// TOOD: Maybe put profile on top of profile class?
/**
 * @returns The barycenter of nodes associated to {@link nodeToFindAssociationsFor}.
 */
export const computeMiddleOfRelatedAssociationsPositionAction = (nodeToFindAssociationsFor: string,
                                                            notifications: UseNotificationServiceWriterType,
                                                            graph: ModelGraphContextType,
                                                            diagram: UseDiagramType,
                                                            classesContext: ClassesContextType) => {
    // TODO: !!!! Use this ... the variant with selection, this is just so I have something which works for this branch
    // const associatedClasses: string[] = findAssociatedClassesAndClassUsages(nodeToFindAssociationsFor);
    const associatedClasses: string[] = findAssociatedClasses(nodeToFindAssociationsFor, classesContext.classes, classesContext.relationships).map(classs => classs.id);


    // TODO: I should probably rewrite so it works with visual model only (because right now we are using the diagram component to compute barycenter).
    const visualModel = graph.aggregatorView.getActiveVisualModel();
    if(visualModel === null) {
        // TODO: 1) Maybe it would be nice to kind of unify the notifiactions? SInce this check for visual model being null is done on like 5 different places
        // TODO: 2) I actually don't need the active visual model, since I can take the same data from editor ... but idk?
        notifications.error("There is no active visual model");
        // TODO: return getMiddleOfViewportForNodePositionAction(diagram);
        return {x: 0, y: 0};
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
    // TODO: Maybe here also call physical layout algorithm to improve the barycenter
    // TODO: Or maybe also shift like in the case of the middle of viewport

    return barycenter;
};


// TODO: Help method, maybe can be put somewhere else
/**
 *
 * @param positions
 * @param editorAPI
 * @returns The barycenter of given positions.
 */
const computeBarycenter = (positions: Position[], diagram: UseDiagramType): Position => {
    const barycenter = positions.reduce((accumulator: Position, currentValue: Position) => {
        accumulator.x += currentValue.x;
        accumulator.y += currentValue.y;

        return accumulator;
    }, {x: 0, y: 0, anchored: null});

    if(positions.length > 1) {
        barycenter.x /= positions.length;
        barycenter.y /= positions.length;
    }
    else {
        barycenter.x = 0;
        barycenter.y = 0;
        // TODO: Return middle of viewport instead !!

        // const viewportMiddle = getMiddleOfViewportForNodePositionAction(diagram);
        // barycenter.x = viewportMiddle.x;
        // barycenter.y = viewportMiddle.y;
    }

    return barycenter;
};



// TODO: !!! For now ... We can replace the following methods by the systematic selection later (using the following commented code) !!!

// export const findAssociatedClassesAndClassUsages = (nodeToFindAssociationsFor: string) => {
//     // TODO: Actually if the passed semantic models are null, then the function isn't async
//     const selection = extendSelection([nodeToFindAssociationsFor], ["ASSOCIATION"], "ONLY-VISIBLE", null);
//     return selection;
// }


//////
// Helper methods

type ZeroOrOne = 0 | 1;

const getSecondEnd = (end: ZeroOrOne) => {
    return 1 - end;
};

const checkForAssociatedClass = (id: string, end: ZeroOrOne, classes: SemanticModelClass[], relationship: SemanticModelRelationship) => {
    if(relationship.ends[end]?.concept === id && relationship.ends[getSecondEnd(end)]?.concept !== null) {
        return classes.find(cclass => cclass.id === relationship.ends[getSecondEnd(end)]?.concept);
    }
    else {
        return null;
    }
};


const findAssociatedClasses = (id: string, classes: SemanticModelClass[],
                                relationships: SemanticModelRelationship[]): SemanticModelClass[] => {
    // TODO: Don't forget about profiles, also I think that I wrote the same method for the selection !!!!!
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
