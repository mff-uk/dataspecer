import { ModelGraphContextType } from "../context/model-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";

/**
 * Center diagram editor view to the given visual node.
 * The visual node can be a node or an edge.
 */
export function centerViewportToVisualEntityAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  entityIdentifier: string,
  _modelIdentifier: string,
) {
  const visualModel = graph.aggregatorView.getActiveVisualModel();
  if (visualModel === null) {
    notifications.error("There is no active visual model.");
    return;
  }
  const entity = visualModel.getVisualEntityForRepresented(entityIdentifier);
  if (entity === null) {
    notifications.error("There is no visual representation of the entity.");
    return;
  }
  diagram.actions().centerViewportToNode(entity.identifier);
};
