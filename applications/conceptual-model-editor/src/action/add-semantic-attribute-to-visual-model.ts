import { isVisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { addSemanticAttributeToVisualNodeAction } from "./add-semantic-attribute-to-visual-node";
import { ClassesContextType } from "../context/classes-context";
import { isSemanticModelAttribute, SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelAttributeUsage, SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { SemanticModelClassProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { isSemanticModelAttributeProfile } from "../dataspecer/semantic-model";
import { getDomainAndRange } from "../util/relationship-utils";

export function addSemanticAttributeToVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  visualModel: WritableVisualModel,
  domainIdentifier: string,
  attribute: string,
  shouldReportDuplicateAsNotification: boolean,
) {
  const visualNodes = visualModel.getVisualEntitiesForRepresented(domainIdentifier);
  for (const visualNode of visualNodes) {
    if(!isVisualNode(visualNode)) {
      notifications.error("Given domain is not of a type visual node");
      continue;
    }

    addSemanticAttributeToVisualNodeAction(
      notifications, visualModel, visualNode, attribute, null, shouldReportDuplicateAsNotification);
  }
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
