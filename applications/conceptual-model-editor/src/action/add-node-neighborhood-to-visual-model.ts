import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { changeSelectionVisibilityAction } from "./change-selection-visibility";

export const addNodeNeighborhoodToVisualModelAction = (nodeIdentifier: string,
                                                graph: ModelGraphContextType,
                                                notifications: UseNotificationServiceWriterType): void => {
    // TODO: Get the selection through the systematic selection feature
    const neighborhoodEntitiesIdentifiers: string[] = [];
    changeSelectionVisibilityAction(neighborhoodEntitiesIdentifiers, notifications, graph, true);
};