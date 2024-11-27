import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { sourceModelOfEntity } from "../util/model-utils";
import { isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { addSemanticClassToVisualModelAction } from "./add-class-to-visual-model";
import { addSemanticClassProfileToVisualModelAction } from "./add-class-profile-to-visual-model";
import { addSemanticRelationshipToVisualModelAction } from "./add-relationship-to-visual-model";
import { addSemanticRelationshipProfileToVisualModelAction } from "./add-relationship-profile-to-visual-model";
import { addSemanticGeneralizationToVisualModelAction } from "./add-generalization-to-visual-model";

export function addSemanticEntityToVisualModelAction(
    notifications: UseNotificationServiceWriterType,
    graph: ModelGraphContextType,
    visualModel: WritableVisualModel,
    diagram: UseDiagramType,
    entityIdentifier: string,
    position: { x: number, y: number } | null,
  ) {
    const model = sourceModelOfEntity(entityIdentifier, [...graph.models.values()]);
    if(model === undefined) {
        notifications.error(`The entity ${entityIdentifier} which should have been added to visual model doesn't have source semantic model`);
        return;
    }
    const modelIdentifier = model.getId();

    const entity = model.getEntities()[entityIdentifier];
    if(isSemanticModelClass(entity)) {
        addSemanticClassToVisualModelAction(notifications, graph, visualModel, diagram, entityIdentifier, modelIdentifier, position);
    }
    else if(isSemanticModelClassUsage(entity)) {
        addSemanticClassProfileToVisualModelAction(notifications, graph, visualModel, diagram, entityIdentifier, modelIdentifier, position);
    }
    else if(isSemanticModelRelationship(entity)) {
        addSemanticRelationshipToVisualModelAction(notifications, graph, visualModel, entityIdentifier, modelIdentifier);
    }
    else if(isSemanticModelRelationshipUsage(entity)) {
        addSemanticRelationshipProfileToVisualModelAction(notifications, graph, visualModel, entityIdentifier, modelIdentifier);
    }
    else if(isSemanticModelGeneralization(entity)) {
        addSemanticGeneralizationToVisualModelAction(notifications, graph, visualModel, entityIdentifier, modelIdentifier);
    }
    else {
        notifications.error("The added semantic entity is of unknown type within the semantic model");
    }
  }