import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { sourceModelOfEntity } from "../util/model-utils";
import { useActions } from "./actions-react-binding";
import { addSemanticClassToVisualModelAction } from "./add-class-to-visual-model";
import { removeFromVisualModelAction } from "./remove-from-visual-model";

/**
 * Changes visibility of given {@link nodeSelection} and {@link edgeSelection} to given {@link visibility}.
 */
export const changeSelectionVisibilityAction = (nodeSelection: string[], edgeSelection: string[],
                                                notifications: UseNotificationServiceWriterType,
                                                graph: ModelGraphContextType,
                                                visibility: boolean): void => {
    // TODO: Since I concat, maybe I don't need to distinguish between edges and nodes, so I can just pass in 1 argument named selection
    for(const selectedEntityId of edgeSelection.concat(nodeSelection)) {
        // TODO: Again we can delete all at once instead of removing sequentially
        if(visibility === false) {
            removeFromVisualModelAction(notifications, graph, selectedEntityId);
        }
        else {
            // TODO: Also we should account for the fact that the node can already be present, so we don't want to add it again

            const model = sourceModelOfEntity(selectedEntityId, [...graph.models.values()]);
            const modelIdentifier = model?.getId();
            if(modelIdentifier === undefined) {
                notifications.error(`The selected entity ${selectedEntityId} doesn't have model`);
                continue;
            }
            // TODO: Again add all at once instead sequential call
            useActions().addClassToVisualModel(modelIdentifier, selectedEntityId, null)
        }
    }
};
