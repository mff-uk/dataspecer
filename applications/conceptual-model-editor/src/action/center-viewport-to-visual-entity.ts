import { isVisualGroup, isVisualNode, isVisualRelationship, VisualEntity } from "@dataspecer/core-v2/visual-model";
import { ModelGraphContextType } from "../context/model-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { SemanticModelRelationship, isSemanticModelAttribute } from "@dataspecer/core-v2/semantic-model/concepts";
import { SemanticModelRelationshipUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { ClassesContextType } from "../context/classes-context";
import { getDomainAndRange } from "../util/relationship-utils";

/**
 * Center diagram editor view to the visual entity represented by given semantic entity,
 * identified by {@link entityIdentifier}.
 * In case of attribute, the visual entity is node, which corresponds to the attribute's domain.
 * The visual entity can be a node or an edge.
 */
export function centerViewportToVisualEntityByRepresentedAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  classesContext: ClassesContextType,
  diagram: UseDiagramType,
  entityIdentifier: string,
  currentlyIteratedEntity: number,
  _modelIdentifier: string,
) {
  const attribute = findAttributeWithIdentifier(entityIdentifier, classesContext);
  // TODO RadStr: For the implementation of content
  // let isAttribute = false;
  if(attribute !== undefined) {
    let domainClassIdentifier;
    if(isSemanticModelAttribute(attribute)) {
      domainClassIdentifier = getDomainAndRange(attribute)?.domain?.concept ?? null;
    }
    else {
      domainClassIdentifier = getDomainAndRange(attribute)?.domain?.concept ?? null;
    }

    if(domainClassIdentifier === null) {
      notifications.error("Focused attribute doesn't have domain node");
      return;
    }

    entityIdentifier = domainClassIdentifier;
  }

  const visualModel = graph.aggregatorView.getActiveVisualModel();
  if (visualModel === null) {
    notifications.error("There is no active visual model.");
    return;
  }
  const visualEntities = visualModel.getVisualEntitiesForRepresented(entityIdentifier);
  if (visualEntities.length === 0) {
    notifications.error("There is no visual representation of the entity.");
    return;
  }
  // TODO RadStr: For the implementation of content
  // if(isAttribute) {
  //   visualEntities.filter(isVisualNode).filter(node => node.content.includes(attribute!.id));
  // }
  const visualEntity = visualEntities[Math.trunc(currentlyIteratedEntity) % visualEntities.length];
  centerToVisualEntity(diagram, visualEntity);
};

/**
 * @returns undefined if the relationship with given identifier wasn't found. Otherwise the found relationship or relationship usage -
 * Note that the returned type depends on the actual entity
 */
export function findAttributeWithIdentifier(identifier: string, classesContext: ClassesContextType) {
  const attributes = classesContext.relationships.filter(isSemanticModelAttribute);
  const attributeUsages = classesContext.usages.filter(isSemanticModelAttributeUsage);
  const attributeProfiles = classesContext.relationshipProfiles.filter(isSemanticModelAttributeProfile);

  const allAttributes = ([] as (SemanticModelRelationship |
    SemanticModelRelationshipProfile |
    SemanticModelRelationshipUsage)[]).concat(attributes).concat(attributeUsages).concat(attributeProfiles);

  return allAttributes.find(attribute => attribute.id === identifier);
}

// Could be exported and used for centering to visual entities
export function centerToVisualEntity(
  diagram: UseDiagramType,
  visualEntity: VisualEntity,
) {
  if(isVisualNode(visualEntity) || isVisualGroup(visualEntity)) {
    diagram.actions().centerViewportToNode(visualEntity.identifier);
  }
  else if(isVisualRelationship(visualEntity)) {
    diagram.actions().fitToView([visualEntity.visualSource, visualEntity.visualTarget]);
  }
}
