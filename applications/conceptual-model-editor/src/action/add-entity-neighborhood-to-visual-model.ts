import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { EntityToAddToVisualModel, addSemanticEntitiesToVisualModelAction } from "./add-semantic-entities-to-visual-model";
import { ExtensionType, NodeSelection, VisibilityFilter, extendSelectionAction } from "./extend-selection-action";
import { isSemanticModelAttribute, isSemanticModelRelationship, SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelRelationshipProfile, SemanticModelClassProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { isSemanticModelAttributeProfile } from "@/dataspecer/semantic-model";
import { getDomainAndRange, getDomainAndRangeConcepts } from "@/util/relationship-utils";
import { addSemanticClassToVisualModelAction } from "./add-class-to-visual-model";
import { findSourceModelOfEntity } from "@/service/model-service";
import { addSemanticClassProfileToVisualModelAction } from "./add-class-profile-to-visual-model";
import { addSemanticRelationshipToVisualModelAction } from "./add-relationship-to-visual-model";
import { addSemanticRelationshipProfileToVisualModelAction } from "./add-relationship-profile-to-visual-model";
import { findPositionForNewNodesUsingLayouting, findPositionForNewNodeUsingLayouting } from "./layout-visual-model";
import { XY } from "@dataspecer/layout";
import { addEntitiesFromSemanticModelToVisualModelAction } from "./add-entities-from-semantic-model-to-visual-model";
import { getVisualNodeContentBasedOnExistingEntities } from "./add-semantic-attribute-to-visual-model";

export const addEntityNeighborhoodToVisualModelAction = async (
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  visualModel: WritableVisualModel,
  identifier: string
): Promise<void> => {
  const allClasses = (classes.classes as (SemanticModelClass | SemanticModelClassProfile)[])
    .concat(classes.classProfiles);
  const allRelationships = [
    ...classes.relationships,
    ...classes.relationshipProfiles
  ];

  const isClassOrClassProfile = allClasses.findIndex(cclass => cclass.id === identifier) >= 0;
  if (isClassOrClassProfile) {
    return addClassNeighborhoodToVisualModelAction(notifications, classes, graph, diagram, visualModel, identifier);
  }
  else {
    const possibleRelationship = allRelationships.find(relationship => relationship.id === identifier);
    if (possibleRelationship === undefined) {
      notifications.error("The given entity to find neighborhood for is of unknown type");
      return;
    }

    if (isSemanticModelAttribute(possibleRelationship)) {
      const { domain } = getDomainAndRange(possibleRelationship);
      if (domain === null || domain.concept === null) {
        notifications.error("Given entity is attribute, but it does not have domain class");
        return;
      }

      addClassOrClassProfileToVisualModel(
        notifications, classes, graph, diagram, visualModel,
        domain.concept, null, false, [possibleRelationship.id]);
    }
    else if (isSemanticModelAttributeProfile(possibleRelationship)) {
      const { domain } = getDomainAndRange(possibleRelationship);
      if (domain === null || domain.concept === null) {
        notifications.error("Given entity is attribute profile, but it does not have domain class");
        return;
      }

      addClassOrClassProfileToVisualModel(
        notifications, classes, graph, diagram, visualModel,
        domain.concept, null, false, [possibleRelationship.id]);
    }
    else if (isSemanticModelRelationship(possibleRelationship) ||
             isSemanticModelRelationshipProfile(possibleRelationship)) {
      if (visualModel.hasVisualEntityForRepresented(identifier)) {
        return;
      }

      const { domain, range } = getDomainAndRangeConcepts(possibleRelationship);
      if (domain === null) {
        notifications.error("Given entity is relationship or relationship profile, but it does not have domain class");
        return;
      }
      if (range === null) {
        notifications.error("Given entity is relationship or relationship profile, but it does not have range class");
        return;
      }

      const positions = await findPositionForNewNodesUsingLayouting(
        notifications, diagram, graph, visualModel, classes, [domain, range]);
      const isDomainAdded = await addClassOrClassProfileToVisualModel(
        notifications, classes, graph, diagram, visualModel,
        domain, positions[domain], false, []);
      if (!isDomainAdded) {
        return;
      }

      const isRangeAdded = await addClassOrClassProfileToVisualModel(
        notifications, classes, graph, diagram, visualModel,
        range, positions[range], false, []);
      if (!isRangeAdded) {
        return;
      }

      const model = findSourceModelOfEntity(identifier, graph.models);
      if (model === null) {
        notifications.error("Given entity is relationship or relationship profile, but it has missing source model");
        return;
      }
      if (isSemanticModelRelationship(possibleRelationship)) {
        addSemanticRelationshipToVisualModelAction(
          notifications, graph, visualModel, identifier, model.getId());
      }
      else {
        addSemanticRelationshipProfileToVisualModelAction(
          notifications, graph, visualModel, identifier, model.getId());
      }
    }
  }
}

function addSemanticClassOrClassProfileToVisualModelCommand(
  classes: ClassesContextType,
  visualModel: WritableVisualModel,
  entity: SemanticModelClass | SemanticModelClassProfile,
  model: string,
  position: { x: number, y: number },
  content: string[] | null
): string {
  const nodeContent = content ?? getVisualNodeContentBasedOnExistingEntities(
    classes, entity);
  return visualModel.addVisualNode({
    model: model,
    representedEntity: entity.id,
    position: {
      x: position.x,
      y: position.y,
      anchored: null,
    },
    content: nodeContent,
    visualModels: [],
  });
}

/**
 * Checks if given given {@link identifier} is class or class profile and if so, it is added to visual model.
 * @param shouldAddRelatedEntities if true, then related entities like edges to existing nodes are added.
 * If false just the node is added and nothing else.
 * @returns true if the class or class profile was added. False if failure occurred.
 */
const addClassOrClassProfileToVisualModel = async (
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  visualModel: WritableVisualModel,
  identifier: string,
  position: XY | null,
  shouldAddRelatedEntities: boolean,
  nodeContent: string[] | null,
): Promise<boolean> => {
  if (visualModel.hasVisualEntityForRepresented(identifier)) {
    return true;
  }

  const cclass = classes.classes.find(cclass => cclass.id === identifier);
  if (cclass === undefined) {
    const classProfile = classes.classProfiles.find(classProfile => classProfile.id === identifier);

    if (classProfile === undefined) {
      notifications.error("Related entity is neither class or class profile");
      return false;
    }

    const model = findSourceModelOfEntity(classProfile.id, graph.models);
    if (model === null) {
      notifications.error("Related entity is class or class profile, but has missing source model");
      return false;
    }

    if (shouldAddRelatedEntities) {
      addSemanticClassProfileToVisualModelAction(
        notifications, graph, classes, visualModel, diagram,
        identifier, model?.getId(), position);
    }
    else {
      const exactPosition = position ?? await findPositionForNewNodeUsingLayouting(
        notifications, diagram, graph, visualModel, classes, identifier);
      addSemanticClassOrClassProfileToVisualModelCommand(
        classes, visualModel, classProfile, model.getId(), exactPosition, nodeContent);
    }
    return true;
  }

  const model = findSourceModelOfEntity(cclass.id, graph.models);
  if (model === null) {
    notifications.error("Given entity is relationship or relationship profile, but its domain or range has missing source model");
    return false;
  }

  if (shouldAddRelatedEntities) {
    addSemanticClassToVisualModelAction(
      notifications, graph, classes, visualModel, diagram, cclass.id, model.getId(), position);
  }
  else {
    const exactPosition = position ?? await findPositionForNewNodeUsingLayouting(
      notifications, diagram, graph, visualModel, classes, identifier);
    addSemanticClassOrClassProfileToVisualModelCommand(
      classes, visualModel, cclass, model.getId(), exactPosition, nodeContent);
  }

  return true;
}

const addClassNeighborhoodToVisualModelAction = async (
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  visualModel: WritableVisualModel,
  identifier: string
): Promise<void> => {
  const inputForExtension: NodeSelection = {
    identifiers: [identifier],
    areIdentifiersFromVisualModel: false
  };
  const neighborhoodPromise = extendSelectionAction(
    notifications, graph, classes, inputForExtension,
    [ExtensionType.Association, ExtensionType.Generalization],
    VisibilityFilter.All, false, null);

  return neighborhoodPromise.then(async (neighborhood) => {
    const classesOrClassProfilesToAdd: EntityToAddToVisualModel[] = [{identifier, position: null}];

    // We have to filter the source class, whose neighborhood we are adding, from the extension.
    // Because we don't want to have duplicate there.
    classesOrClassProfilesToAdd.push(
      ...neighborhood.selectionExtension.nodeSelection
        .filter(node => node !== identifier)
        .map(node => ({ identifier: node, position: null }))
    );
    await addSemanticEntitiesToVisualModelAction(
      notifications, classes, graph, visualModel, diagram, classesOrClassProfilesToAdd);

    // Some might got already added by the fact that the relevant class was added, but the action will deal with that.
    const allNeighborhoodSemanticEdges = neighborhood.selectionExtension.edgeSelection
      .map(semanticEdge => ({ identifier: semanticEdge, position: null }));
    await addSemanticEntitiesToVisualModelAction(
      notifications, classes, graph, visualModel, diagram, allNeighborhoodSemanticEdges);
  });
};
