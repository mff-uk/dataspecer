import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { changeSelectionVisibilityAction } from "./change-selection-visibility";

/**
 * Changes visibility of given {@link selection} to given {@link visibility}.
 * @param selection
 * @param notifications
 * @param graph
 * @param classesContext
 * @param visibility
 */
export const changeSemanticModelVisibilityAction = (semanticModelIdentifier: string,
                                                graph: ModelGraphContextType,
                                                notifications: UseNotificationServiceWriterType,
                                                visibility: boolean): void => {
    // TODO: Get the selection through the systematic selection feature
    const semanticModelEntitiesIdentifiers: string[] = [];
    changeSelectionVisibilityAction(semanticModelEntitiesIdentifiers, notifications, graph, visibility);
};
