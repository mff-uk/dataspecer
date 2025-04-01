import { isVisualNode, isVisualProfileRelationship, isVisualRelationship, isVisualDiagramNode, VisualModel, VisualDiagramNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { getClassesAndDiagramNodesModelsFromVisualModelRecursively, getViewportCenterForClassPlacement, getVisualDiagramNodeMappingsByVisual, getVisualSourceAndTargetForEdge } from "./utilities";
import { ModelGraphContextType, UseModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { createNewVisualModelAction } from "./create-new-visual-model-from-source-visual-model";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { removeFromVisualModelByVisualAction } from "./remove-from-visual-model-by-visual";
import { UseDiagramType } from "@/diagram/diagram-hook";
import { addVisualDiagramNode } from "@/dataspecer/visual-model/operation/add-visual-diagram-node";

/**
 * Creates new visual diagram node node, which is referencing existing visual model {@link existingModel}.
 * The newly created visual diagram node is put into the {@link visualModelToAddTo}
 * @returns The identifier of the created visual diagram node.
 */
export function addVisualDiagramNodeForExistingModelToVisualModelAction(
  diagram: UseDiagramType,
  visualModelToAddTo: WritableVisualModel,
  label: LanguageString,
  description: LanguageString,
  visualModelToRepresent: string,
): string {

  // Just use the center of screen instead of layouting, User will want to play with it anyways.
  const position = getViewportCenterForClassPlacement(diagram);

  const visualDiagramNodeIdentifier = addVisualDiagramNode(
    visualModelToAddTo, label, description, position, visualModelToRepresent);
  return visualDiagramNodeIdentifier;
}
