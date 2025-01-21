import { isVisualNode, VisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
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
import { getStringFromLanguageStringInLang } from "../util/language-utils";

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

  const onConfirm = (state: EditNodeAttributesState) => {
    visualModel.updateVisualEntity(node.identifier, {content: state.attributes.map(attribute => attribute.identifier)});
  }

  // TODO RadStr: Commented code - if we will want to do something with relationships
  //                               (that is transforming them into attributes and vice versa)
  // const relationships = classes.relationships
  //   .filter(relationship => !node.content.includes(relationship.id) && getDomainAndRange(relationship).domain?.concept === node.representedEntity)
  //   .map(relationship => ({identifier: relationship.id, name: relationship.name[options.language]}));
  const { visibleAttributes, hiddenAttributes } = splitIntoVisibleAndHiddenAttributes(classes.rawEntities, node, options.language);

  dialogs.openDialog(createEditClassAttributesDialog(onConfirm, visibleAttributes, hiddenAttributes));
}

type VisibleAnHiddenAttributes = {
  visibleAttributes: IdentifierAndName[],
  hiddenAttributes: IdentifierAndName[],
};

function splitIntoVisibleAndHiddenAttributes(
  rawEntities: (Entity | null)[],
  node: VisualNode,
  language: Language
): VisibleAnHiddenAttributes {
  const visibleAttributes: IdentifierAndName[] = [];
  const hiddenAttributes: IdentifierAndName[] = [];
  const defaultName = "Can not find name for attribute";
  rawEntities.forEach(rawEntity => {
    const isVisible = node.content.findIndex(visibleAttribute => visibleAttribute === rawEntity?.id) !== -1;
    let name: string;
    if (isSemanticModelAttribute(rawEntity)) {
      const domainAndRange = getDomainAndRange(rawEntity);
      if(domainAndRange.domain?.concept !== node.representedEntity) {
        return;
      }
      const nameAsLanguageString = domainAndRange.range?.name ?? null;
      name = getStringFromLanguageStringInLang(nameAsLanguageString, language)[0] ?? defaultName;
    }
    else if (isSemanticModelAttributeUsage(rawEntity)) {
      const domainAndRange = getDomainAndRange(rawEntity);
      if(domainAndRange.domain?.concept !== node.representedEntity) {
        return;
      }
      const nameAsLanguageString = domainAndRange.range?.name ?? null;
      name = getStringFromLanguageStringInLang(nameAsLanguageString, language)[0] ?? defaultName;
    }
    else {
      return null;
    }

    const attribute = {
      identifier: rawEntity.id,
      name,
    };
    if(isVisible) {
      visibleAttributes.push(attribute);
    }
    else {
      hiddenAttributes.push(attribute);
    }
  });

  return {
    visibleAttributes,
    hiddenAttributes
  };
}
