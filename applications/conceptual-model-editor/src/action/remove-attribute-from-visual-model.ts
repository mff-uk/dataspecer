import {
  type VisualEntity,
  type VisualModel,
  VisualNode,
  WritableVisualModel,
  isVisualGroup,
  isVisualNode,
  isVisualProfileRelationship,
  isVisualRelationship,
} from "@dataspecer/core-v2/visual-model";

import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { removePartOfGroupContentAction } from "./remove-part-of-group-content";
import { ClassesContextType } from "../context/classes-context";
import { isSemanticModelAttribute, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelAttributeUsage, SemanticModelClassUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { getDomainAndRange } from "../util/relationship-utils";


// I chose to process attributes separately instead of using the removeFromVisualModelAction.
// It needs additional arguments to the method and the attributes are in a way kind of
// separate and are removed only explicitly not in cascade.
// But maybe it is not ideal (RadStr)

/**
 * Remove entity and related entities from visual model.
 */
export function removeAttributeFromVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  visualModel: WritableVisualModel,
  attributeIdentifiers: string[],
) {

  const nodesToRemovedAttributesMap: Record<string, {node: VisualNode, attributesToRemove: string[]}> = {};
  for (const identifier of attributeIdentifiers) {
    let attribute: SemanticModelRelationship | SemanticModelRelationshipUsage | undefined =
      classes.relationships.find(relationship => relationship.id === identifier);
    let domainAndRange;
    if(attribute === undefined || !isSemanticModelAttribute(attribute)) {
      attribute = classes.profiles
        .find(relationship => relationship.id === identifier && isSemanticModelAttributeUsage(relationship)) as SemanticModelRelationshipUsage | undefined;
      if(attribute === undefined) {
        notifications.error("One of given attributes can not be found in semantic models");
        continue;
      }
      else {
        domainAndRange = getDomainAndRange(attribute);
      }
    }
    else {
      domainAndRange = getDomainAndRange(attribute);
    }

    const domainIdentifier = domainAndRange.domain?.concept ?? null;
    if(domainIdentifier === null) {
      notifications.error("One of given attributes has invalid domain");
      continue;
    }
    const node = visualModel.getVisualEntityForRepresented(domainIdentifier);
    if(node === null) {
      notifications.error("One of given attributes has not existing node as domain");
      continue;
    }
    if(!isVisualNode(node)) {
      notifications.error("One of given attributes has something else than node as domain");
      continue;
    }


    // Find the visual entities.
    const visualEntity = visualModel.getVisualEntityForRepresented(domainIdentifier);
    if (visualEntity === null) {
      // The entity is not part of the visual model and thus should not be visible.
      // We ignore the operation for such entity and show an error.
      console.error("Missing visual entity.", { identifier, visualModel });
      continue;
    }

    if(nodesToRemovedAttributesMap[node.identifier] === undefined) {
      nodesToRemovedAttributesMap[node.identifier] = {
        node,
        attributesToRemove: []
      }
    }
    nodesToRemovedAttributesMap[node.identifier].attributesToRemove.push(identifier);
  }

  // Perform the delete operation of collected visual entities.
  Object.entries(nodesToRemovedAttributesMap).forEach(([nodeIdentifer, {node, attributesToRemove}]) => {
    const content = node.content.filter(attribute => !attributesToRemove.includes(attribute));
    visualModel.updateVisualEntity(nodeIdentifer, {content});
  });
}
