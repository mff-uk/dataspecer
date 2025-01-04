import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";

export function removeGroupFromVisualModelAction(
    notifications: UseNotificationServiceWriterType,
    visualModel: WritableVisualModel,
    groupIdentifier: string | null,
): void {
    if(groupIdentifier === null) {
        notifications.error("Dissolving not existing group");
        return;
    }
    visualModel.deleteVisualEntity(groupIdentifier);
}