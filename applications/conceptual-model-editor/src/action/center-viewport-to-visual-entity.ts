import { isVisualGroup, isVisualNode, isVisualRelationship, VisualEntity, VisualModel } from "@dataspecer/core-v2/visual-model";
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
  const attribute = findRelationshipOrRelationshipUsage(entityIdentifier, classesContext);
  let isAttribute = false;
  if(attribute !== undefined) {
    // It can be attribute or association
    if(isSemanticModelAttribute(attribute)) {
      const domainNodeIdentifier = getDomainAndRange(attribute)?.domain?.concept ?? null;

      if(domainNodeIdentifier === null) {
        notifications.error("Focused attribute doesn't have domain node");
        return;
      }

      isAttribute = true;
      entityIdentifier = domainNodeIdentifier;
    }
  }

  const visualModel = graph.aggregatorView.getActiveVisualModel();
  if (visualModel === null) {
    notifications.error("There is no active visual model.");
    return;
  }
  let visualEntities = visualModel.getVisualEntitiesForRepresented(entityIdentifier);
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
 * @returns undefined if the relationship with given identifier wasn't found.
 *          Otherwise the found relationship or relationship usage -
 *          Note that the returned type depends on the actual entity
 */
export function findRelationshipOrRelationshipUsage(identifier: string, classesContext: ClassesContextType) {
  const entity = (classesContext.relationships as (SemanticModelRelationship | SemanticModelRelationshipUsage)[]).
    concat(classesContext.usages.filter(isSemanticModelRelationshipUsage)).find(entity => entity?.id === identifier);
  return entity;
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