import { VisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";

// TODO RadStr: Document
export function addSemanticAttributeToVisualNodeAction(
  notifications: UseNotificationServiceWriterType,
  visualModel: WritableVisualModel,
  domainNode: VisualNode,
  attribute: string,
  position: number | null,
  shouldReportDuplicateAsNotification: boolean,
) {
  if(domainNode.content.includes(attribute)) {
    if(shouldReportDuplicateAsNotification) {
      notifications.error("The given attribute to be shown is already present on the visual node");
    }
    return;
  }

  const validPosition = position ?? domainNode.content.length;

  const newContent = [...domainNode.content];
  newContent.splice(validPosition, 0, attribute);

  visualModel.updateVisualEntity(domainNode.identifier, { content: newContent });
}
