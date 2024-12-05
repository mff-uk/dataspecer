import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ModelGraphContextType } from "../context/model-context";
import { sourceModelOfEntity } from "../util/model-utils";
import { removeFromSemanticModelAction } from "./remove-from-semantic-model";


/**
 * Removes the given {@link nodeSelection} and {@link edgeSelection} from the semantic models.
 * @returns Removed entities, i.e. the entities which were part of some local model.
 */
export const removeSelectionFromSemanticModelAction = (nodeSelection: string[], edgeSelection: string[],
                                                        notifications: UseNotificationServiceWriterType,
                                                        graph: ModelGraphContextType): Record<string, Promise<void>> => {
    const removeEntitiesPromises: Record<string, Promise<void>> = {};

    // TODO RadStr: Since I concat, maybe I don't need to distinguish between edges and nodes, so I can just pass in 1 argument named selection
    edgeSelection.concat(nodeSelection).forEach(selectedEntityId => {
        const model = sourceModelOfEntity(selectedEntityId, [...graph.models.values()]);
        if(model === undefined) {
            notifications.error("Entity from selection is not present in semantic model.");
            return;
        }
        // At first I thought that it will be enough to just put all the operations into array and call executeOperations instead of executeOperation.
        // So if we wanted to undo it we had it registered as one action, but we actually can't do that, at least not this way, because:
        //    1) Not all entities are from the same model
        //    2) Even if they were, the model can be external, which means we will sequentially call (but in asynchronous manner) the releaseClass method
        const promise = removeFromSemanticModelAction(notifications, graph, model.getId(), selectedEntityId);
        removeEntitiesPromises[selectedEntityId] = promise;
    });

    return removeEntitiesPromises;
};
