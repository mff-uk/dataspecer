import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { getSelectionForWholeSemanticModel } from "./extend-selection-action";
import { EntityToAddToVisualModel, addSemanticEntitiesToVisualModelAction } from "./add-semantic-entities-to-visual-model";
import { ClassesContextType } from "../context/classes-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { EntityModel } from "@dataspecer/core-v2";
import { isSemanticModelAttribute, isSemanticModelClass, isSemanticModelRelationship, SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassProfile, SemanticModelClassProfile, SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { isSemanticModelAttributeUsage, isSemanticModelClassUsage, SemanticModelClassUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { isSemanticModelAttributeProfile } from "../dataspecer/semantic-model";
import { addSemanticAttributeToVisualModelAction } from "./add-semantic-attribute-to-visual-model";
import { getDomainAndRange } from "../util/relationship-utils";

/**
 * Adds entities from given semantic model identified by {@link semanticModelIdentifier} to currently active visual model.
 */
export const addEntitiesFromSemanticModelToVisualModelAction = async (
  notifications: UseNotificationServiceWriterType,
  classesContext: ClassesContextType,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  visualModel: WritableVisualModel,
  semanticModel: EntityModel
): Promise<void> => {
  // Passing in true, because the classic relationships are added by default when adding class
  // while the relationship profiles are not
  const entitiesFromSemanticModel = getSelectionForWholeSemanticModel(semanticModel, visualModel, true);
  let entitiesToAddToVisualModel: EntityToAddToVisualModel[] = entitiesFromSemanticModel.nodeSelection.map(node => ({
    identifier: node,
    position: null,
  }));

  entitiesToAddToVisualModel.push(...entitiesFromSemanticModel.edgeSelection.map(edge => ({identifier: edge, position: null})));
  entitiesToAddToVisualModel = entitiesToAddToVisualModel
    .filter(entity => visualModel.getVisualEntityForRepresented(entity.identifier) === null);

  const existingClassesAndClassProfiles = entitiesFromSemanticModel.nodeSelection
    .filter(identifier => visualModel.getVisualEntityForRepresented(identifier) !== null)
    .map(identifier => classesContext.rawEntities.find(entity => entity?.id === identifier))
    .filter(entity => entity !== null && entity !== undefined)
    .filter(entity => isSemanticModelClass(entity) ||
                      isSemanticModelClassProfile(entity) ||
                      isSemanticModelClassUsage(entity));

  await addSemanticEntitiesToVisualModelAction(notifications, classesContext, graph, visualModel, diagram, entitiesToAddToVisualModel);

  addHiddenAttributesForExistingClassesAndClassProfiles(
    notifications, classesContext, visualModel, existingClassesAndClassProfiles);
};

function addHiddenAttributesForExistingClassesAndClassProfiles(
  notifications: UseNotificationServiceWriterType,
  classesContext: ClassesContextType,
  visualModel: WritableVisualModel,
  existingClassesAndClassProfiles: (SemanticModelClass | SemanticModelClassProfile | SemanticModelClassUsage)[]
): void {
  // TODO RadStr: The finding of allAttributes could maybe be part of some exported utility function
  const attributes = classesContext.relationships.filter(isSemanticModelAttribute);
  const attributeUsages = classesContext.usages.filter(isSemanticModelAttributeUsage);
  const attributeProfiles = classesContext.relationshipProfiles.filter(isSemanticModelAttributeProfile);

  const allAttributes = ([] as (SemanticModelRelationship |
    SemanticModelRelationshipProfile |
    SemanticModelRelationshipUsage)[]).concat(attributes).concat(attributeUsages).concat(attributeProfiles);

  for (const existingClassOrClassProfile of existingClassesAndClassProfiles) {
    for(const attribute of allAttributes) {
      if(isSemanticModelRelationship(attribute)) {
        const { domain } = getDomainAndRange(attribute);
        if(domain?.concept !== existingClassOrClassProfile.id) {
          continue;
        }
      }
      else {
        const { domain } = getDomainAndRange(attribute);
        if(domain?.concept !== existingClassOrClassProfile.id) {
          continue;
        }
      }
      // TODO RadStr: Maybe it would be better to allow for the function to take more than 1 attribute
      addSemanticAttributeToVisualModelAction(
        notifications, visualModel, existingClassOrClassProfile.id, attribute.id, null, false);
    }
  }
}
