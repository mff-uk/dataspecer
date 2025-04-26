import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { getViewportCenterForClassPlacement, doesAddingVisualModelCauseSelfReference } from "./utilities";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { UseDiagramType } from "@/diagram/diagram-hook";
import { addVisualDiagramNode } from "@/dataspecer/visual-model/operation/add-visual-diagram-node";
import { ModelGraphContextType } from "@/context/model-context";
import { UseNotificationServiceWriterType } from "@/notification/notification-service-context";

/**
 * Creates new visual diagram node, which is referencing existing visual model {@link existingModel}.
 * The newly created visual diagram node is put into the {@link visualModelToAddTo}
 * @returns The identifier of the created visual diagram node. Null if the action failed
 */
export function addVisualDiagramNodeForExistingModelToVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  visualModelToAddTo: WritableVisualModel,
  label: LanguageString,
  description: LanguageString,
  visualModelToRepresent: string,
): string | null {

  const availableVisualModels = graph.aggregatorView.getAvailableVisualModels();
  const doesAddingCauseModelRecursion = doesAddingVisualModelCauseSelfReference(
    availableVisualModels, visualModelToAddTo, visualModelToRepresent);
  if (doesAddingCauseModelRecursion) {
    notifications.error("The added visual model represented by diagram node would cause self-reference");
    return null;
  }
  // Just use the center of screen instead of layouting, User will want to play with it anyways.
  const position = getViewportCenterForClassPlacement(diagram);

  const visualDiagramNodeIdentifier = addVisualDiagramNode(
    visualModelToAddTo, position, visualModelToRepresent);
  return visualDiagramNodeIdentifier;
}
