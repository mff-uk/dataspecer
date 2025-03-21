import { isVisualNode, VisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { createEditClassAttributesDialog } from "../dialog/visual-node/edit-node-attributes-dialog";
import { getDomainAndRange } from "../util/relationship-utils";
import { Entity } from "@dataspecer/core-v2";
import { Options } from "../application";
import { Language } from "../configuration/options";
import { isSemanticModelAttribute, isSemanticModelClass, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { getStringFromLanguageStringInLang } from "../util/language-utils";
import { isSemanticModelAttributeProfile } from "../dataspecer/semantic-model";
import { createAttributeProfileLabel, getEntityLabelToShowInDiagram } from "../util/utils";
import { isSemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { AttributeData, EditNodeAttributesState } from "../dialog/visual-node/edit-node-attributes-dialog-state";

export function openEditNodeAttributesDialogAction(
  dialogs: DialogApiContextType,
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  options: Options,
  visualModel: WritableVisualModel,
  nodeIdentifier: string,
) {
  const node = visualModel.getVisualEntity(nodeIdentifier);
  if (node === null) {
    notifications.error("Node to modify attribute's position on, could not be found");
    return;
  }
  if (!isVisualNode(node)) {
    notifications.error("Node to modify attribute's position on, is not a node");
    return;
  }

  const onConfirm = (state: EditNodeAttributesState) => {
    visualModel.updateVisualEntity(node.identifier, {
      content: state.visibleAttributes.map(attribute => attribute.identifier)
    });
  }

  // For some reason we have to do this and can't take classes.rawEntities
  // If we don't do this then the name of attribute profile is sometimes undefined.
  const entities = [
    ...classes.classes,
    ...classes.relationships,
    ...classes.usages,
    ...classes.classProfiles,
    ...classes.relationshipProfiles,
  ];

  // TODO RadStr: Commented code - if we will want to do something with relationships
  //                               (that is transforming them into attributes and vice versa)
  // const relationships = classes.relationships
  //   .filter(relationship => !node.content.includes(relationship.id) && getDomainAndRange(relationship).domain?.concept === node.representedEntity)
  //   .map(relationship => ({identifier: relationship.id, name: relationship.name[options.language]}));
  const { visibleAttributes, hiddenAttributes } = splitIntoVisibleAndHiddenAttributes(entities, node, options.language);

  const editedClass = classes.classes.find(cclass => cclass?.id === node.representedEntity) ?? null;
  const isClassProfile = !isSemanticModelClass(editedClass);

  dialogs.openDialog(createEditClassAttributesDialog(
    onConfirm, visibleAttributes, hiddenAttributes, node.representedEntity,
    isClassProfile, options.language));
}

type VisibleAnHiddenAttributes = {
  visibleAttributes: AttributeData[],
  hiddenAttributes: AttributeData[],
};

function splitIntoVisibleAndHiddenAttributes(
  rawEntities: (Entity | null)[],
  node: VisualNode,
  language: Language
): VisibleAnHiddenAttributes {
  const visibleAttributesUnordered: AttributeData[] = [];
  const hiddenAttributes: AttributeData[] = [];
  const defaultName = "Can not find name for attribute";
  rawEntities.forEach(rawEntity => {
    const isVisible = node.content.findIndex(visibleAttribute => visibleAttribute === rawEntity?.id) !== -1;
    let name: string;
    let profileOfText: string | null;
    if (isSemanticModelAttribute(rawEntity)) {
      const domainAndRange = getDomainAndRange(rawEntity);
      if (domainAndRange.domain?.concept !== node.representedEntity) {
        return null;
      }
      const nameAsLanguageString = domainAndRange.range?.name ?? null;
      name = getStringFromLanguageStringInLang(nameAsLanguageString, language)[0] ?? defaultName;
      profileOfText = null;
    }
    else if (isSemanticModelAttributeProfile(rawEntity)) {
      const { domain } = getDomainAndRange(rawEntity);
      if (domain?.concept !== node.representedEntity) {
        return null;
      }

      name = createAttributeProfileLabel(language, rawEntity);
      const profileOfEntities = rawEntities.filter(
        entity => entity !== null && rawEntity.ends.find(end => end.profiling.includes(entity.id)) !== undefined)
        // Attributes are also relationships, so there is no need to include them in the check
        .filter(entity => isSemanticModelRelationship(entity) || isSemanticModelRelationshipProfile(entity));

      profileOfText = profileOfEntities.map(item => getEntityLabelToShowInDiagram(language, item)).join(", ");
    }
    else {
      return null;
    }

    const attribute = {
      identifier: rawEntity.id,
      name,
      profileOf: profileOfText
    };
    if (isVisible) {
      visibleAttributesUnordered.push(attribute);
    }
    else {
      hiddenAttributes.push(attribute);
    }
  });

  const visibleAttributes: AttributeData[] = node.content
    .map(attributeIdentifier => visibleAttributesUnordered.find(attribute => attribute.identifier === attributeIdentifier))
    .filter(attribute => attribute !== undefined);
  return {
    visibleAttributes,
    hiddenAttributes
  };
}
