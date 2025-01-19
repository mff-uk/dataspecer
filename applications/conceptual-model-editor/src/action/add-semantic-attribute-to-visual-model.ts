import { isVisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { getDomainAndRange } from "../util/relationship-utils";
import { isSemanticModelAttributeUsage, isSemanticModelClassUsage, isSemanticModelRelationshipUsage, SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { isSemanticModelAttribute, SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { ClassesContextType } from "../context/classes-context";


// TODO RadStr: Maybe not really an action but just helper method?
export function addSemanticAttributeToVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  visualModel: WritableVisualModel,
  domainIdentifier: string,
  attribute: string | null,
  position: number | null,
) {
  if(attribute === null) {
    return;
  }
  const visualNode = visualModel.getVisualEntityForRepresented(domainIdentifier);
  if(visualNode === null) {
    return;
  }
  if(!isVisualNode(visualNode)) {
    notifications.error("The visual node representing domain of attribute is not a visual node");
    return;
  }
  if(position === null) {
    position = visualNode.content.length;
  }

  const newContent = [...visualNode.content];
  newContent.splice(position, 0, attribute);

  visualModel.updateVisualEntity(visualNode.identifier, {content: newContent});
}

/**
 * @returns The visual content (attributes) of node to relevant values existing in semantic model.
 */
export function getVisualNodeContentBasedOnExistingEntities(
  classes: ClassesContextType,
  entity: SemanticModelClass | SemanticModelClassUsage,
): string[] {
  const nodeContent: string[] = [];
  const attributes = classes.relationships.filter(isSemanticModelAttribute);
  const attributesProfiles = classes.profiles.filter(isSemanticModelAttributeUsage);

  const nodeAttributes = attributes
    .filter(isSemanticModelAttribute)
    .filter((attr) => getDomainAndRange(attr).domain?.concept === entity.id);

  const nodeAttributeProfiles = attributesProfiles
    .filter(isSemanticModelAttributeUsage)
    .filter((attr) => getDomainAndRange(attr).domain?.concept === entity.id);

  for (const attribute of nodeAttributes) {
    nodeContent.push(attribute.id);
  }

  for (const attributeProfile of nodeAttributeProfiles) {
    nodeContent.push(attributeProfile.id);
  }

  return nodeContent;
}