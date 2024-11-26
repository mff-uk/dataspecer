import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { changeSelectionVisibilityAction } from "./change-selection-visibility";

/**
 * Changes visibility of given {@link selection} to given {@link visibility}.
 */
export const changeSemanticModelVisibilityAction = (semanticModelIdentifier: string,
                                                graph: ModelGraphContextType,
                                                notifications: UseNotificationServiceWriterType,
                                                visibility: boolean): void => {
    // TODO: Get the selection through the systematic selection feature
    const semanticModelNodeIdentifiers: string[] = [];
    const semanticModelEdgeIdentifiers: string[] = [];
    changeSelectionVisibilityAction(semanticModelNodeIdentifiers, semanticModelEdgeIdentifiers, notifications, graph, visibility);
};
