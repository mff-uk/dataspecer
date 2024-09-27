import { getMiddleOfViewportForNodePosition } from "./place-class-in-middle";
import { computeBarycenter } from "./utils";
import { ModelGraphContextType } from "../../context/model-context";
import { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";

export const computeMiddleOfRelatedAssociationsPosition = (nodeToFindAssociationsFor: string, graph: ModelGraphContextType,
                                                    classes: SemanticModelClass[], relationships: SemanticModelRelationship[], editorApi: EditorApiContextType) => {
    const associatedClasses = findAssociatedClasses(nodeToFindAssociationsFor, classes, relationships);     // Can also use extend selection action instead
    const visualEntities = graph.aggregatorView.getActiveVisualModel()?.getVisualEntities();
    if(visualEntities === undefined) {
        return getMiddleOfViewportForNodePosition(editorApi);
    }
    const associatedPositions = associatedClasses.map(cclass => {
        return visualEntities.get(cclass.id)?.position;         // TODO: Work with VisualNode type instead
    });

    const barycenter = computeBarycenter(associatedPositions.filter(pos => pos !== undefined));

    return barycenter;
};

export const putNodeToMiddleOfAssociations = (nodeId: string, graph: ModelGraphContextType,
                                        classes: SemanticModelClass[], relationships: SemanticModelRelationship[], editorApi: EditorApiContextType,) => {
    const node = graph.aggregatorView.getActiveVisualModel()?.getVisualEntity(nodeId);
    if(node === undefined) {
        return;
    }
    const barycenter = computeMiddleOfRelatedAssociationsPosition(nodeId, graph, classes, relationships, editorApi);
    // TODO: Maybe here also call physical layout algorithm to improve the barycenter

    graph.updateNodePosition(node, barycenter);
};