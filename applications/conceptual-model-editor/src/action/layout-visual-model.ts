import { isVisualNode, isWritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ExplicitAnchors, INodeClassic, NodeDimensionQueryHandler, performLayoutOfVisualModel, ReactflowDimensionsConstantEstimator, ReactflowDimensionsEstimator, UserGivenConstraintsVersion4, VisualModelWithOutsiders } from "@dataspecer/layout";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ActionsContextType } from "./actions-react-binding";
import { UseDiagramType } from "../diagram/diagram-hook";
import { addNodeToVisualModelAction } from "./add-node-to-visual-model";
import { XY } from "@dataspecer/layout";


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
    diagram: UseDiagramType,
    graph: ModelGraphContextType,
    configuration: UserGivenConstraintsVersion4,
    explicitAnchors?: ExplicitAnchors,
    shouldUpdatePositionsInVisualModel?: boolean,
    outsiders?: Record<string, XY | null>,
    shouldPutOutsidersInVisualModel?: boolean,
) {
    const activeVisualModel = graph.aggregatorView.getActiveVisualModel();
    if (activeVisualModel === null) {
      notifications.error("There is no active visual model.");
      return Promise.resolve();
    }
    if (!isWritableVisualModel(activeVisualModel)) {
      notifications.error("The active visual model is not writable.");
      return Promise.resolve();
    }

    const models = graph.models;

    const reactflowDimensionQueryHandler = createExactNodeDimensionsQueryHandler(diagram, graph, notifications);

    outsiders = outsiders ?? {};
    const activeVisualModelWithOutsiders: VisualModelWithOutsiders = {
        visualModel: activeVisualModel,
        outsiders,
    };

    return performLayoutOfVisualModel(activeVisualModelWithOutsiders,
                                models,
                                configuration,
                                reactflowDimensionQueryHandler,
                                explicitAnchors).then(layoutResult => {
                                    // TODO: After merge rewrite in the same way it was changed by PeSk
                                    console.info("Layout result in editor");
                                    console.info(layoutResult);
                                    console.info(activeVisualModel.getVisualEntities());
                                    if(!isWritableVisualModel(activeVisualModel)) {
                                        return layoutResult;
                                    }
                                    if(shouldUpdatePositionsInVisualModel === false) {
                                        return layoutResult;
                                    }

                                    Object.entries(layoutResult).forEach(([key, value]) => {
                                        const visualEntity = value.visualEntity
                                        if(value.isOutsider) {
                                            if(shouldPutOutsidersInVisualModel) {
                                                if(isVisualNode(visualEntity)) {
                                                    addNodeToVisualModelAction(notifications, graph, visualEntity.model, visualEntity.representedEntity, visualEntity.position);
                                                }
                                                else {
                                                    throw new Error("Not prepared for creating new elements which are not nodes when layouting");
                                                }
                                            }
                                            return;
                                        }

                                        // TODO: I am not sure if this "if" ever passes for non-outsiders, maybe we should keep only the else branch.
                                        if(activeVisualModel.getVisualEntity(key) === undefined) {
                                            if(isVisualNode(visualEntity)) {
                                                console.info("NEW NODE");
                                                addNodeToVisualModelAction(notifications, graph, visualEntity.model, visualEntity.representedEntity, visualEntity.position);
                                            }
                                            else {
                                                throw new Error("Not prepared for creating new elements which are not nodes when layouting");
                                            }
                                        }
                                        else {
                                            // TODO: Maybe we should somehow update all entities at once
                                            // If the entity isn't there, then nothing happens (at least for current implementation)
                                            activeVisualModel?.updateVisualEntity(visualEntity.identifier, visualEntity);
                                        }
                                    });

                                    return layoutResult;
                            }).catch((e) => {
                                console.warn(e);
                                return Promise.resolve();
                            });
}


// TODO: Should be separate file?
export function layoutActiveVisualModelAction(
    notifications: UseNotificationServiceWriterType,
    diagram: UseDiagramType,
    graph: ModelGraphContextType,
    configuration: UserGivenConstraintsVersion4,
    explicitAnchors?: ExplicitAnchors,
) {
    return layoutActiveVisualModelAdvancedAction(notifications, diagram, graph, configuration, explicitAnchors, true, {}, false);
}


export function createExactNodeDimensionsQueryHandler(diagram: UseDiagramType,
                                                      graph: ModelGraphContextType,
                                                      notifications: UseNotificationServiceWriterType): NodeDimensionQueryHandler {
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
