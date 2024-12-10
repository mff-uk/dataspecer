import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";

export const addClassNeighborhoodToVisualModelAction = (
    graph: ModelGraphContextType,
    notifications: UseNotificationServiceWriterType,
    identifier: string
): void => {
    // TODO RadStr: Get the selection through the systematic selection feature and use addSemanticEntitiesToVisualModelAction for the actual addition
    const nodeNeighborhoodOfClassIdentifiers: string[] = [];
    const edgeNeighborhoodofClassIndetifiers: string[] = [];
};