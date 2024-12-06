import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { changeSelectionVisibilityAction } from "./change-selection-visibility";

export const addClassNeighborhoodToVisualModelAction = (
    graph: ModelGraphContextType,
    notifications: UseNotificationServiceWriterType,
    identifier: string
): void => {
    // TODO RadStr: Get the selection through the systematic selection feature
    const nodeNeighborhoodOfClassIdentifiers: string[] = [];
    const edgeNeighborhoodofClassIndetifiers: string[] = [];
    changeSelectionVisibilityAction(notifications, graph, true, nodeNeighborhoodOfClassIdentifiers, edgeNeighborhoodofClassIndetifiers);
};