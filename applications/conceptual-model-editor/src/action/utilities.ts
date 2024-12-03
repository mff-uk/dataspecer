import { Entity } from "@dataspecer/core-v2";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";

import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { createLogger } from "../application";

const LOG = createLogger(import.meta.url);

/**
 * Can handler with aggregated entity of given identifier and type.
 */
export function withAggregatedEntity<Type extends Entity>(
  notifications: UseNotificationServiceWriterType,
  entities: Record<string, AggregatedEntityWrapper>,
  entityIdentifier: string,
  _modelIdentifier: string,
  predicated: (entity: Entity) => entity is Type,
  handler: (entity: Type) => void,
) {
  const entity = entities[entityIdentifier].aggregatedEntity;
  if (entity === undefined || entity === null) {
    notifications.error("Missing semantic entity.");
    return;
  }
  if (!predicated(entity)) {
    notifications.error("Invalid entity type!");
    LOG.invalidEntity(entityIdentifier, "Entity is not of an expected type.", { entity });
    return;
  }
  handler(entity);
}

/**
 * Return center position of current viewport.
 */
export function getViewportCenter(diagram: UseDiagramType) {
  const viewport = diagram.actions().getViewport();
  return {
    x: viewport.position.x + (viewport.width / 2),
    y: viewport.position.y + (viewport.height / 2),
  };
}
