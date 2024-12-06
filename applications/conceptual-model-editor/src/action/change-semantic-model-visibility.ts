import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { changeSelectionVisibilityAction } from "./change-selection-visibility";

/**
 * Changes visibility of given {@link selection} to given {@link visibility}.
 */
export const changeSemanticModelVisibilityAction = (
    notifications: UseNotificationServiceWriterType,
    graph: ModelGraphContextType,
    visibility: boolean,
    semanticModelIdentifier: string
): void => {
    // TODO RadStr: Get the selection through the systematic selection feature
    const semanticModelNodeIdentifiers: string[] = [];
    const semanticModelEdgeIdentifiers: string[] = [];
    changeSelectionVisibilityAction(notifications, graph, visibility, semanticModelNodeIdentifiers, semanticModelEdgeIdentifiers);
};
