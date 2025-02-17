import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { EntityDsIdentifier, EntityReference, isEntityReferenceEqual, ModelDsIdentifier } from "../../entity-model";

/**
 * Propagate changes in the list of profiles to the visual model.
 * Add new profile relations and delete removed relations.
 *
 * If the entity is not represented in visual model then to nothing.
 * If target entity does not exist in visual model do nothing.
 */
export function updateVisualNodeProfiles(
  visualModel: WritableVisualModel,
  entity: {
    id: EntityDsIdentifier,
  },
  model: ModelDsIdentifier,
  previous: EntityReference[],
  next: EntityReference[],
) {
  const { create, remove } = createChangeList(previous, next, isEntityReferenceEqual);
  const entityVisuals = visualModel.getVisualEntitiesForRepresented(entity.id);
  if (entityVisuals.length === 0) {
    // There should be no relationship for this entity in the model.
    return;
  }
  console.log(">updateVisualNodeProfiles", {previous, next, create, remove});
  // Add new.
  for (const item of create) {
    const visuals = visualModel.getVisualEntitiesForRepresented(item.identifier);
    if (visuals.length === 0) {
      continue;
    }
    for(const entityVisual of entityVisuals) {
      for(const visual of visuals) {
        visualModel.addVisualProfileRelationship({
          entity: entity.id,
          model,
          visualSource: entityVisual.identifier,
          visualTarget: visual.identifier,
          waypoints: [],
        });
      }
    }
  }

  // Delete removed.
  for (const item of remove) {
    const visuals = visualModel.getVisualEntitiesForRepresented(item.identifier);
    for(const visual of visuals) {
      visualModel.deleteVisualEntity(visual.identifier);
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
  return items.filter(item => remove.find(removeItem => eq(item, removeItem) !== undefined));
}
