import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ModelGraphContextType } from "../context/model-context";
import { sourceModelOfEntity } from "../util/model-utils";
import { removeFromSemanticModelAction } from "./remove-from-semantic-model";


/**
 * Removes the given {@link selection} from the semantic models.
 * @returns Removed entities, i.e. the entities which were part of some local model.
 */
export const removeSelectionFromSemanticModelAction = (selection: string[],
                                                        notifications: UseNotificationServiceWriterType,
                                                        graph: ModelGraphContextType): Record<string, Promise<void>> => {
    const removeEntitiesPromises: Record<string, Promise<void>> = {};

    selection.forEach(selectedEntityId => {
        const model = sourceModelOfEntity(selectedEntityId, [...graph.models.values()]);
        if(model === undefined) {
            notifications.error("Entity from selection is not present in semantic model.");
            return;
        }
        // TODO: Or maybe delete all at once, we need to reimplement the action but call executeOperations instead of executeOperation
        const promise = removeFromSemanticModelAction(notifications, graph, model.getId(), selectedEntityId);
        removeEntitiesPromises[selectedEntityId] = promise;
    });

    return removeEntitiesPromises;
};
