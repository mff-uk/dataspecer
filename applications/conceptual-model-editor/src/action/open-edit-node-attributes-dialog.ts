import { isVisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { createEditClassAttributesDialog } from "../dialog/class/edit-node-attributes-dialog";
import { getDomainAndRange } from "../util/relationship-utils";
import { EditNodeAttributesState } from "../dialog/class/edit-node-attributes-dialog-controller";


export function openEditNodeAttributesDialogAction(
  dialogs: DialogApiContextType,
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  visualModel: WritableVisualModel,
  nodeIdentifier: string,
) {
  const node = visualModel.getVisualEntity(nodeIdentifier);
  if(node === null) {
    notifications.error("Node to modify attribute's position on, could not be found");
    return;
  }
  if(!isVisualNode(node)) {
    notifications.error("Node to modify attribute's position on, is not a node");
    return;
  }

  const relationships = classes.relationships
    .filter(relationship => !node.content.includes(relationship.id) && getDomainAndRange(relationship).domain?.concept === node.representedEntity)
    .map(relationship => relationship.id);

  const onConfirm = (state: EditNodeAttributesState) => {
    visualModel.updateVisualEntity(node.identifier, {content: state.attributes});
  }
  dialogs.openDialog(createEditClassAttributesDialog(onConfirm, node.content, relationships));
}
