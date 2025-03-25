import {
  VisualNode,
  WritableVisualModel,
  isVisualNode,
} from "@dataspecer/core-v2/visual-model";

import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ClassesContextType } from "../context/classes-context";
import { isSemanticModelAttribute, SemanticModelRelationship, SemanticModelRelationshipEnd } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelAttributeUsage, SemanticModelRelationshipEndUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { DomainAndRange, getDomainAndRange } from "../util/relationship-utils";
import { SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { isSemanticModelAttributeProfile } from "../dataspecer/semantic-model";

// I chose to process attributes separately instead of using the removeFromVisualModelAction.
// It needs additional arguments to the method and the attributes are in a way kind of
// separate and are removed only explicitly not in cascade.
// But maybe it is not ideal (RadStr)

/**
 * Remove entity and related entities from visual model.
 */
export function removeAttributesFromVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  visualModel: WritableVisualModel,
  attributeIdentifiers: string[],
) {

  const nodeToRemovedAttributesMap: Record<string, {node: VisualNode, attributesToRemove: string[]}> = {};
  for (const attributeIdentifier of attributeIdentifiers) {
    const domainAndRange = geDomainAndRangeForAttribute(notifications, classes, attributeIdentifier);
    if(domainAndRange === null) {
      continue;
    }
    addAttributesToRemoveToTheMap(
      notifications, visualModel, attributeIdentifier,
      domainAndRange, nodeToRemovedAttributesMap);
  }

  // Perform the delete operation of collected visual entities.
  Object.entries(nodeToRemovedAttributesMap).forEach(([nodeIdentifier, {node, attributesToRemove}]) => {
    const content = node.content.filter(attribute => !attributesToRemove.includes(attribute));
    visualModel.updateVisualEntity(nodeIdentifier, {content});
  });
}

function addAttributesToRemoveToTheMap(
  notifications: UseNotificationServiceWriterType,
  visualModel: WritableVisualModel,
  attributeIdentifier: string,
  domainAndRange: DomainAndRange<SemanticModelRelationshipEndUsage> | DomainAndRange<SemanticModelRelationshipEnd>,
  nodeToRemovedAttributesMap: Record<string, {
    node: VisualNode;
    attributesToRemove: string[];
  }>
) {
  const domainIdentifier = domainAndRange.domain?.concept ?? null;
  if(domainIdentifier === null) {
    notifications.error("Given attribute has invalid domain");
    return;
  }

  const nodes = visualModel.getVisualEntitiesForRepresented(domainIdentifier);
  for (const node of nodes) {
    if(!isVisualNode(node)) {
      notifications.error("Given attribute has something else than node as domain");
      return;
    }

    if(nodeToRemovedAttributesMap[node.identifier] === undefined) {
      nodeToRemovedAttributesMap[node.identifier] = {
        node,
        attributesToRemove: []
      };
    }
    nodeToRemovedAttributesMap[node.identifier].attributesToRemove.push(attributeIdentifier);
  }
}

function geDomainAndRangeForAttribute(
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  attributeIdentifier: string,
): DomainAndRange<SemanticModelRelationshipEndUsage> | DomainAndRange<SemanticModelRelationshipEnd> | null {
  let attribute: SemanticModelRelationship | SemanticModelRelationshipUsage | SemanticModelRelationshipProfile | undefined =
      classes.relationships.find(relationship => relationship.id === attributeIdentifier);
  let domainAndRange;
  if(attribute === undefined || !isSemanticModelAttribute(attribute)) {
    attribute = classes.usages
      .find(relationship => relationship.id === attributeIdentifier &&
                            isSemanticModelAttributeUsage(relationship)) as SemanticModelRelationshipUsage | undefined;
    if(attribute === undefined) {
      attribute = classes.relationshipProfiles
        .find(relationship => relationship.id === attributeIdentifier &&
                              isSemanticModelAttributeProfile(relationship)) as SemanticModelRelationshipProfile | undefined;
    }

    if(attribute === undefined) {
      notifications.error("One of given attributes can not be found in semantic models");
      return null;
    }
    else {
      domainAndRange = getDomainAndRange(attribute);
    }
  }
  else {
    domainAndRange = getDomainAndRange(attribute);
  }

  return domainAndRange;
}
