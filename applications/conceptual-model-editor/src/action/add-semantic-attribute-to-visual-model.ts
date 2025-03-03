import { isVisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { getDomainAndRange } from "../util/relationship-utils";
import { isSemanticModelAttributeUsage, SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { isSemanticModelAttribute, SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { ClassesContextType } from "../context/classes-context";
import { SemanticModelClassProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { isSemanticModelAttributeProfile } from "../dataspecer/semantic-model";

// TODO RadStr: Document
export function addSemanticAttributeToVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  visualModel: WritableVisualModel,
  domainIdentifier: string,
  attribute: string,
  position: number | null,
  shouldReportDuplicateAsNotification: boolean,
) {
  const visualNode = visualModel.getVisualEntityForRepresented(domainIdentifier);
  if(visualNode === null) {
    notifications.error("The visual node representing domain is not present.");
    return;
  }
  if(!isVisualNode(visualNode)) {
    notifications.error("The visual node representing domain of attribute is not a visual node");
    return;
  }
  if(visualNode.content.includes(attribute)) {
    if(shouldReportDuplicateAsNotification) {
      notifications.error("The given attribute to be shown is already present on the visual node");
    }
    return;
  }

  const validPosition = position ?? visualNode.content.length;

  const newContent = [...visualNode.content];
  newContent.splice(validPosition, 0, attribute);

  visualModel.updateVisualEntity(visualNode.identifier, {content: newContent});
}

// TODO RadStr: 1 Action per file
/**
 * @returns The visual content (attributes) of node to relevant values existing in semantic model.
 */
export function getVisualNodeContentBasedOnExistingEntities(
  classes: ClassesContextType,
  entity: SemanticModelClass | SemanticModelClassUsage | SemanticModelClassProfile,
): string[] {
  const nodeContent: string[] = [];
  const attributes = classes.relationships.filter(isSemanticModelAttribute);
  const attributesUsages = classes.usages.filter(isSemanticModelAttributeUsage);
  const attributesProfiles = classes.relationshipProfiles.filter(isSemanticModelAttributeProfile);

  const nodeAttributes = attributes
    .filter(isSemanticModelAttribute)
    .filter((attr) => getDomainAndRange(attr).domain?.concept === entity.id);

  const nodeAttributeUsages = attributesUsages
    .filter(isSemanticModelAttributeUsage)
    .filter((attr) => getDomainAndRange(attr).domain?.concept === entity.id);

  const nodeAttributeProfiles = attributesProfiles
    .filter(isSemanticModelAttributeProfile)
    .filter((attr) => getDomainAndRange(attr).domain?.concept === entity.id);

  for (const attribute of nodeAttributes) {
    nodeContent.push(attribute.id);
  }

  for (const attributeUsage of nodeAttributeUsages) {
    nodeContent.push(attributeUsage.id);
  }

  for (const attributeProfile of nodeAttributeProfiles) {
    nodeContent.push(attributeProfile.id);
  }

  return nodeContent;
}
