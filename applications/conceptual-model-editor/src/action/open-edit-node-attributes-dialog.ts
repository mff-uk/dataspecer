import { isVisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { createEditClassAttributesDialog } from "../dialog/class/edit-node-attributes-dialog";
import { getDomainAndRange } from "../util/relationship-utils";
import { EditNodeAttributesState, IdentifierAndName } from "../dialog/class/edit-node-attributes-dialog-controller";
import { Entity } from "@dataspecer/core-v2";
import { Options } from "../application";
import { Language } from "../application/options";
import { isSemanticModelAttribute } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelAttributeUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";


export function openEditNodeAttributesDialogAction(
  dialogs: DialogApiContextType,
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  options: Options,
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
    .map(relationship => ({identifier: relationship.id, name: relationship.name[options.language]}));

  const onConfirm = (state: EditNodeAttributesState) => {
    visualModel.updateVisualEntity(node.identifier, {content: state.attributes.map(attribute => attribute.identifier)});
  }

  const attributes = createIdentifierAndNameTypeForAttributes(classes.rawEntities, node.content, options.language);
  dialogs.openDialog(createEditClassAttributesDialog(onConfirm, attributes, relationships));
}

function createIdentifierAndNameTypeForAttributes(
  rawEntities: (Entity | null)[],
  attributes: string[],
  language: Language
): IdentifierAndName[] {
  const identifiersAndNames = attributes.map(identifier => {
    const rawEntity = rawEntities.find(entity => entity?.id === identifier) ?? null;
    if(rawEntity === null) {
      return null;
    }

    let name: string;
    if (isSemanticModelAttribute(rawEntity)) {
      name = getDomainAndRange(rawEntity).range?.name?.[language] ?? identifier;
    }
    else if (isSemanticModelAttributeUsage(rawEntity)) {
      name = getDomainAndRange(rawEntity).range?.name?.[language] ?? identifier;
    }
    else {
      return null;
    }

    return {
      identifier,
      name,
    };
  }).filter(result => result !== null);

  return identifiersAndNames;
}