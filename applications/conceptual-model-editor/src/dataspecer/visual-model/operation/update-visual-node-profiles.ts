import { isVisualProfileRelationship, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { EntityReference, isEntityReferenceEqual } from "../../entity-model";

/**
 * Propagate changes in the list of profiles to the visual model.
 * Add new profile relations and delete removed relations.
 *
 * If the entity is not represented in visual model then to nothing.
 * If target entity does not exist in visual model do nothing.
 */
export function updateVisualNodeProfiles(
  visualModel: WritableVisualModel,
  profile: EntityReference,
  previous: EntityReference[],
  next: EntityReference[],
) {
  const { create, remove } = createChangeList(
    previous, next, isEntityReferenceEqual);
  const entityVisual = visualModel.getVisualEntityForRepresented(
    profile.identifier);
  if (entityVisual === null) {
    // There should be no relationship for this entity in the model.
    return;
  }
  // Add new.
  for (const item of create) {
    const visual = visualModel.getVisualEntityForRepresented(item.identifier);
    if (visual === null) {
      continue;
    }
    visualModel.addVisualProfileRelationship({
      entity: profile.identifier,
      model: profile.model,
      visualSource: entityVisual.identifier,
      visualTarget: visual.identifier,
      waypoints: [],
    });
  }
  // We can not delete directly the visual profile as the entity
  // is shared by the profile and the visual node.
  if (remove.length > 0) {
    const removeSet = new Set(remove.map(item => item.identifier));
    const visuals = [...visualModel.getVisualEntities().values()];
    for (const visual of visuals) {
      if (!isVisualProfileRelationship(visual)) {
        // It is not a profile.
        continue;
      }
      if (removeSet.has(visual.entity)) {
        visualModel.deleteVisualEntity(visual.identifier);
      }
    }
  }
}

/**
 * @returns Changes that need to happen to get from previous to next.
 */
function createChangeList<Type>(
  previous: Type[],
  next: Type[],
  eq: (left: Type, right: Type) => boolean,
): {
  create: Type[],
  remove: Type[],
} {
  return {
    create: filterItems(next, previous, eq),
    remove: filterItems(previous, next, eq),
  };
}

/**
 * @returns Items that are in the first array but not in the second one.
 */
function filterItems<Type>(
  items: Type[],
  remove: Type[],
  eq: (left: Type, right: Type) => boolean,
): Type[] {
  return items.filter(item => remove.find(removeItem => eq(item, removeItem)) === undefined);
}
