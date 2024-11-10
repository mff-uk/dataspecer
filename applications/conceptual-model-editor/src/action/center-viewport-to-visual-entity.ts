import { isVisualGroup, isVisualNode, isVisualRelationship } from "@dataspecer/core-v2/visual-model";
import { ModelGraphContextType } from "../context/model-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelRelationshipUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { ClassesContextType } from "../context/classes-context";
import { isAnAttribute, temporaryDomainRangeHelper } from "../util/relationship-utils";

// TODO: Falls apart if we want to represent 1 semantic entities by more visual ones, in such case we want to pass in identifiers of both semantic and the visual entity.
/**
 * Center diagram editor view to the visual entity representing given semantic entity, identified by {@link identifier}.
 * In case of attribute, the visual entity is node, which corresponds to the attribute's domain.
 * The visual entity can be a node or an edge.
 */
export function centerViewportToVisualEntityAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  classesContext: ClassesContextType,
  diagram: UseDiagramType,
  model: string,
  identifier: string,
) {
  const attribute = findRelationshipOrRelationshipUsageWithIdentifier(identifier, classesContext);
  if(attribute !== undefined) {
    // It can be attribute or association
    if(isAnAttribute(attribute)) {
      const domainNodeIdentifier = temporaryDomainRangeHelper(attribute)?.domain?.concept ?? null;

      if(domainNodeIdentifier === null) {
          notifications.error("Focused attribute doesn't have domain node");
          return;
      }

      identifier = domainNodeIdentifier;
    }
  }


  const visualModel = graph.aggregatorView.getActiveVisualModel();
  if (visualModel === null) {
    notifications.error("There is no active visual model.");
    return;
  }
  const entity = visualModel.getVisualEntityForRepresented(identifier);
  if (entity === null) {
    notifications.error("There is no visual representation of the entity.");
    return;
  }
  if(isVisualNode(entity) || isVisualGroup(entity)) {
    diagram.actions().centerViewportToNode(entity.identifier);
  }
  else if(isVisualRelationship(entity)) {
    diagram.actions().fitToView([entity.visualSource, entity.visualTarget]);
  }
};


/**
 * @returns undefined if the relationship with given identifier wasn't found. Otherwise the found relationship or relationship usage -
 * Note that the returned type depends on the actual entity
 */
export function findRelationshipOrRelationshipUsageWithIdentifier(identifier: string, classesContext: ClassesContextType) {
  const entity = (classesContext.relationships as (SemanticModelRelationship | SemanticModelRelationshipUsage)[]).
                    concat(classesContext.profiles.filter(isSemanticModelRelationshipUsage)).find(entity => entity?.id === identifier);
  return entity;
}
