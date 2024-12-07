import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";

/**
 * Adds entities from given semantic model identified by {@link semanticModelIdentifier} to currently active visual model.
 */
export const addEntitiesFromSemanticModelToVisualModelAction = (
    notifications: UseNotificationServiceWriterType,
    graph: ModelGraphContextType,
    semanticModelIdentifier: string
): void => {
    // TODO RadStr: Get the selection through the systematic selection feature and use addSemanticEntitiesToVisualModelAction for the actual addition
    const semanticModelNodeIdentifiers: string[] = [];
    const semanticModelEdgeIdentifiers: string[] = [];
};
