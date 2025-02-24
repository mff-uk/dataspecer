import {
  WritableVisualModel,
} from "@dataspecer/core-v2/visual-model";

import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { collectVisualEntitiesToRemove } from "./remove-from-visual-model-by-visual";
import { removeVisualEntitiesFromVisualModelAction } from "./remove-visual-entities-from-visual-model";

/**
 * Remove entity and related entities from visual model.
 */
export function removeFromVisualModelByRepresentedAction(
  notifications: UseNotificationServiceWriterType,
  visualModel: WritableVisualModel,
  identifiers: string[],
) {
  const getVisualEntitiesForIdentifier = (identifier: string) => {
    return visualModel.getVisualEntitiesForRepresented(identifier);
  };
  const entitiesToRemove = collectVisualEntitiesToRemove(visualModel, identifiers, getVisualEntitiesForIdentifier);
  removeVisualEntitiesFromVisualModelAction(notifications, visualModel, entitiesToRemove);
}
