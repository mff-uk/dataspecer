import { isVisualNode, isWritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ExplicitAnchors, INodeClassic, NodeDimensionQueryHandler, performLayoutOfVisualModel, ReactflowDimensionsConstantEstimator, ReactflowDimensionsEstimator, UserGivenConstraintsVersion4, VisualModelWithOutsiders } from "@dataspecer/layout";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ActionsContextType } from "./actions-react-binding";
import { UseDiagramType } from "../diagram/diagram-hook";
import { addNodeToVisualModelAction } from "./add-node-to-visual-model";
import { XY } from "../../../../packages/layout/lib/elk-layouts";


/**
 *
 * @param notifications
 * @param diagram
 * @param graph
 * @param configuration
 * @param explicitAnchors
 * @param outsiders are elements which are not part of visual model, but we want to layout them anyways. Use-case is for example elements which to be added to visual model.
 * @param shouldPutOutsidersInVisualModel
 * @returns
 */
export function layoutActiveVisualModelAdvancedAction(
    notifications: UseNotificationServiceWriterType,
    diagram: UseDiagramType,
    graph: ModelGraphContextType,
    configuration: UserGivenConstraintsVersion4,
    explicitAnchors?: ExplicitAnchors,
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
                                explicitAnchors).then(result => {
                                    console.info("Layout result in editor");
                                    console.info(result);
                                    console.info(activeVisualModel.getVisualEntities());
                                    if(!isWritableVisualModel(activeVisualModel)) {
                                        return result;
                                    }

                                    Object.entries(result).forEach(([key, value]) => {
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
                                            // TODO: Should update all at once
                                            // If the entity isn't there, then nothing happens (at least for current implementation)
                                            activeVisualModel?.updateVisualEntity(visualEntity.identifier, visualEntity);
                                        }
                                    });

                                    return result;
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
    return layoutActiveVisualModelAdvancedAction(notifications, diagram, graph, configuration, explicitAnchors, {}, false);
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
        const visualNodeIdentifier = activeVisualModel?.getVisualEntityForRepresented(node.id)?.identifier ?? "";
        // The question is what does it mean if the node isn't in editor? Same for height
        // Actually it is not error, it can be valid state when we are layouting elements which are not yet part of visual model
        const width = diagram.actions().getNodeWidth(visualNodeIdentifier) ?? new ReactflowDimensionsEstimator().getWidth(node);
        return width;
    };
    const getHeight = (node: INodeClassic) => {
        const visualNodeIdentifier = activeVisualModel?.getVisualEntityForRepresented(node.id)?.identifier ?? "";
        const height = diagram.actions().getNodeHeight(visualNodeIdentifier) ?? new ReactflowDimensionsEstimator().getHeight(node);
        return height;
    };

    return {
        getWidth,
        getHeight
    };
}
