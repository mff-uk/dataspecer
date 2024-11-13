import { isVisualNode, isWritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ExplicitAnchors, INodeClassic, NodeDimensionQueryHandler, performLayoutOfVisualModel, ReactflowDimensionsConstantEstimator, ReactflowDimensionsEstimator, UserGivenConstraintsVersion4 } from "@dataspecer/layout";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ActionsContextType } from "./actions-react-binding";
import { UseDiagramType } from "../diagram/diagram-hook";
import { addNodeToVisualModelAction } from "./add-node-to-visual-model";


export function layoutActiveVisualModelAction(
    notifications: UseNotificationServiceWriterType,
    diagram: UseDiagramType,
    graph: ModelGraphContextType,
    configuration: UserGivenConstraintsVersion4,
    explicitAnchors?: ExplicitAnchors,
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

    return performLayoutOfVisualModel(activeVisualModel,
                                models,
                                configuration,
                                reactflowDimensionQueryHandler,
                                explicitAnchors).then(result => {
                                    console.info("Layout result in editor");
                                    console.info(result);
                                    console.info(activeVisualModel.getVisualEntities());
                                    if(!isWritableVisualModel(activeVisualModel)) {
                                        return;
                                    }

                                    Object.entries(result).forEach(([key, value]) => {
                                        if(activeVisualModel.getVisualEntity(key) === undefined) {
                                            if(isVisualNode(value)) {
                                                console.info("NEW NODE");
                                                addNodeToVisualModelAction(notifications, graph, value.model, value.representedEntity, value.position);
                                            }
                                            else {
                                                throw new Error("Not prepared for anything other than nodes when layouting")
                                            }
                                        }
                                        else {
                                            // TODO: Should update all at once
                                            console.info("UPDATING");
                                            console.info(value.identifier);
                                            console.info(value);
                                            activeVisualModel?.updateVisualEntity(value.identifier, value);
                                        }
                                    });
                            }).catch(console.warn);
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
        // The question is what does it mean if the ndoe isn't in editor? I think that it means that there is mistake in program. Same for height
        const width = diagram.actions().getNodeWidth(visualNodeIdentifier) ?? ReactflowDimensionsConstantEstimator.getDefaultWidth();
        return width;
    };
    const getHeight = (node: INodeClassic) => {
        const visualNodeIdentifier = activeVisualModel?.getVisualEntityForRepresented(node.id)?.identifier ?? "";
        const height = diagram.actions().getNodeHeight(visualNodeIdentifier) ?? ReactflowDimensionsConstantEstimator.getDefaultHeight();
        return height;
    };

    return {
        getWidth,
        getHeight
    };
}
