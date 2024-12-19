import { isVisualNode, isWritableVisualModel, VisualEntity, VisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ExplicitAnchors, getDefaultMainUserGivenAlgorithmConstraint, getDefaultUserGivenConstraintsVersion4, INodeClassic, LayoutedVisualEntities, NodeDimensionQueryHandler, performLayoutOfVisualModel, ReactflowDimensionsConstantEstimator, ReactflowDimensionsEstimator, UserGivenAlgorithmConfigurationStress, UserGivenConstraintsVersion4, VisualModelWithOutsiders } from "@dataspecer/layout";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ActionsContextType } from "./actions-react-binding";
import { UseDiagramType } from "../diagram/diagram-hook";
import { XY } from "@dataspecer/layout";
import { ClassesContextType } from "../context/classes-context";
import { computeMiddleOfRelatedAssociationsPositionAction } from "./utilities";
import { isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { addSemanticClassToVisualModelAction } from "./add-class-to-visual-model";
import { addSemanticClassProfileToVisualModelAction } from "./add-class-profile-to-visual-model";
import { LayoutedVisualEntity } from "../../../../packages/layout/lib/migration-to-cme-v2";

/**
 * @param configuration The configuration for layouting algorithm.
 * @param explicitAnchors For more context check the type {@link ExplicitAnchors}. But in short it is used to override the anchors stored in visual model.
 * @param shouldUpdatePositionsInVisualModel If set to true, then update the visual model. If false then not and only return the result of layouting, default is true.
 * @param outsiders are elements which are not part of visual model, but we want to layout them anyways. Use-case is for example elements which are to be added to visual model.
 * @param shouldPutOutsidersInVisualModel If set to true, then the outsiders will be put into visual model, if false then not, but user can still see them in the returned result. Default is false
 * @returns
 */
export function layoutActiveVisualModelAdvancedAction(
    notifications: UseNotificationServiceWriterType,
    classes: ClassesContextType,
    diagram: UseDiagramType,
    graph: ModelGraphContextType,
    visualModel: WritableVisualModel,
    configuration: UserGivenConstraintsVersion4,
    explicitAnchors?: ExplicitAnchors,
    shouldUpdatePositionsInVisualModel?: boolean,
    outsiders?: Record<string, XY | null>,
    shouldPutOutsidersInVisualModel?: boolean,
) {
    const models = graph.models;

    const reactflowDimensionQueryHandler = createExactNodeDimensionsQueryHandler(diagram, graph, notifications);

    outsiders = outsiders ?? {};
    const activeVisualModelWithOutsiders: VisualModelWithOutsiders = {
        visualModel,
        outsiders,
    };

    return performLayoutOfVisualModel(
        activeVisualModelWithOutsiders,
        models,
        configuration,
        reactflowDimensionQueryHandler,
        explicitAnchors
    ).then(layoutResult => {
        processLayoutResult(notifications, classes, diagram, graph, visualModel,
            shouldUpdatePositionsInVisualModel ?? true, shouldPutOutsidersInVisualModel ?? false, layoutResult);
        return layoutResult;
    }).catch((e) => {
        console.warn(e);
        return Promise.resolve();
    });
}

//

// TODO PRQuestion: Should be separate file? same for the method under
export function layoutActiveVisualModelAction(
    notifications: UseNotificationServiceWriterType,
    classes: ClassesContextType,
    diagram: UseDiagramType,
    graph: ModelGraphContextType,
    visualModel: WritableVisualModel,
    configuration: UserGivenConstraintsVersion4,
    explicitAnchors?: ExplicitAnchors,
) {
    return layoutActiveVisualModelAdvancedAction(notifications, classes, diagram, graph, visualModel, configuration, explicitAnchors, true, {}, false);
}

//

export async function findPositionForNewNodesUsingLayouting(
    notifications: UseNotificationServiceWriterType,
    diagram: UseDiagramType,
    graph: ModelGraphContextType,
    visualModel: WritableVisualModel,
    classes: ClassesContextType,
    identifiers: string[],
): Promise<Record<string, XY>> {
    const identifiersWithPositions: Record<string, XY> = {};
    const explicitAnchors: ExplicitAnchors = {
        notAnchored: [],
        anchored: [],
        shouldAnchorEverythingExceptNotAnchored: "anchor-everything-except-notAnchored",
    };
    for(const identifier of identifiers) {
        const computedInitialPosition = await computeMiddleOfRelatedAssociationsPositionAction(notifications, graph, visualModel, diagram, classes, identifier);
        // If there is more than 1 identifier on input, we will just layout it somewhere, so we don't have multiple entities in the middle
        // Otherwise put it in the middle (respectively return the middle position)
        if(computedInitialPosition.isInCenterOfViewport && identifiers.length === 1) {
            return {
                [identifier]: computedInitialPosition.position
            };
        }
        const maxDeviation = 100;
        computedInitialPosition.position.x += Math.floor(Math.random() * maxDeviation) - maxDeviation / 2;
        computedInitialPosition.position.y += Math.floor(Math.random() * maxDeviation) - maxDeviation / 2;
        explicitAnchors.notAnchored.push(identifier);
        identifiersWithPositions[identifier] = computedInitialPosition.position;
    }

    const configuration = getDefaultUserGivenConstraintsVersion4();
    configuration.chosenMainAlgorithm = "elk_stress";
    configuration.main.elk_stress = getDefaultMainUserGivenAlgorithmConstraint("elk_stress");
    configuration.main.elk_stress.interactive = true;
    // TODO RadStr: We can do better by using average edge length in graph.
    (configuration.main.elk_stress as UserGivenAlgorithmConfigurationStress).stress_edge_len = 500;

    // We only want to get the new positions, so we don't update the visual model.
    // We save some performance by that, but more importantly elk can move nodes even if they are
    // anchored (for example when they are not connected by any edge).
    const layoutResults = await layoutActiveVisualModelAdvancedAction(
        notifications,
        classes,
        diagram,
        graph,
        visualModel,
        configuration,
        explicitAnchors,
        false,
        identifiersWithPositions,
        false
    );

    console.info("layoutResults");
    console.info(layoutResults);


    for(const identifier of identifiers) {
        // https://stackoverflow.com/questions/50959135/detecting-that-a-function-returned-void-rather-than-undefined
        if(layoutResults !== null && typeof layoutResults === 'object') {
            const newVisualEntityForNewNode = Object.entries(layoutResults).find(([visualEntityIdentifier, visualEntity]) => {
                if(isVisualNode(visualEntity.visualEntity)) {
                    return visualEntity.visualEntity.representedEntity === identifier;
                }
                return false;
            })?.[1].visualEntity;

            console.info("newVisualEntityForNewNode");
            console.info(newVisualEntityForNewNode);
            if(newVisualEntityForNewNode !== undefined && isVisualNode(newVisualEntityForNewNode)) {
                identifiersWithPositions[identifier] = newVisualEntityForNewNode.position;
            }
        }
    }

    return identifiersWithPositions;
}

//
//

export function createExactNodeDimensionsQueryHandler(
    diagram: UseDiagramType,
    graph: ModelGraphContextType,
    notifications: UseNotificationServiceWriterType
): NodeDimensionQueryHandler {
    const activeVisualModel = graph.aggregatorView.getActiveVisualModel();
    if(activeVisualModel === null) {
        notifications.error("No active visual model");
        return new ReactflowDimensionsEstimator();
    }

    const getWidth = (node: INodeClassic) => {
        const visualNodeIdentifier = activeVisualModel.getVisualEntityForRepresented(node.id)?.identifier ?? "";
        // The question is what does it mean if the node isn't in editor? Same for height
        // Actually it is not error, it can be valid state when we are layouting elements which are not yet part of visual model
        const width = diagram.actions().getNodeWidth(visualNodeIdentifier) ?? new ReactflowDimensionsEstimator().getWidth(node);
        return width;
    };
    const getHeight = (node: INodeClassic) => {
        const visualNodeIdentifier = activeVisualModel.getVisualEntityForRepresented(node.id)?.identifier ?? "";
        const height = diagram.actions().getNodeHeight(visualNodeIdentifier) ?? new ReactflowDimensionsEstimator().getHeight(node);
        return height;
    };

    return {
        getWidth,
        getHeight
    };
}


function processLayoutResult(
    notifications: UseNotificationServiceWriterType,
    classes: ClassesContextType,
    diagram: UseDiagramType,
    graph: ModelGraphContextType,
    visualModel: WritableVisualModel,
    shouldUpdatePositionsInVisualModel: boolean,
    shouldPutOutsidersInVisualModel: boolean,
    layoutResult: LayoutedVisualEntities
) {
    console.info("Layout result in editor");
    console.info(layoutResult);
    console.info(visualModel.getVisualEntities());
    if(shouldUpdatePositionsInVisualModel === false) {
        return;
    }

    Object.entries(layoutResult).forEach(([visualIdentifer, layouredVisualEntity]) => {
        const visualEntity = layouredVisualEntity.visualEntity
        if(layouredVisualEntity.isOutsider) {
            if(shouldPutOutsidersInVisualModel) {
                if(isVisualNode(visualEntity)) {
                    addClassOrClassProfileToVisualModel(notifications, classes, diagram, graph, visualModel, visualEntity);
                }
                else {
                    throw new Error("Not prepared for creating new elements which are not nodes when layouting");
                }
            }
            return;
        }

        // TODO RadStr: I am not sure if this "if" ever passes for non-outsiders, maybe we should keep only the else branch.
        if(visualModel.getVisualEntity(visualIdentifer) === undefined) {
            if(isVisualNode(visualEntity)) {
                console.info("NEW NODE");
                addClassOrClassProfileToVisualModel(notifications, classes, diagram, graph, visualModel, visualEntity);
            }
            else {
                throw new Error("Not prepared for creating new elements which are not nodes when layouting");
            }
        }
        else {
            // TODO RadStr: Maybe we should somehow update all entities at once
            // If the entity isn't there, then nothing happens (at least for current implementation)
            visualModel?.updateVisualEntity(visualEntity.identifier, visualEntity);
        }
    });
}


function addClassOrClassProfileToVisualModel(
    notifications: UseNotificationServiceWriterType,
    classes: ClassesContextType,
    diagram: UseDiagramType,
    graph: ModelGraphContextType,
    visualModel: WritableVisualModel,
    visualNode: VisualNode
): void {
    const represented = graph.aggregatorView.getEntities()[visualNode.representedEntity]?.rawEntity;
    if (isSemanticModelClass(represented)) {
        addSemanticClassToVisualModelAction(notifications, graph, classes, visualModel, diagram, visualNode.representedEntity, visualNode.model, visualNode.position);
    } else if (isSemanticModelClassUsage(represented)) {
        addSemanticClassProfileToVisualModelAction(notifications, graph, classes, visualModel, diagram, visualNode.representedEntity, visualNode.model, visualNode.position);
    } else {
        throw new Error("Unexpected node type.");
    }
}
