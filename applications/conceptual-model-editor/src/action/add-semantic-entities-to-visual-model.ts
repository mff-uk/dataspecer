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
import { EntityModel } from "@dataspecer/core-v2";
import { ClassesContextType } from "../context/classes-context";


export type EntityToAddToVisualModel = {
    /**
     * Identifies the semantic entity to be added to visual model.
     */
    identifier: string,
    // TODO RadStr: I have XY type defined in layouting, but it is probably in differnet branch.
    /**
     * The position to put the newly created visual entity at if the position is null or undefined then default placement is chosen based on type of entity.
     */
    position?: { x: number, y: number } | null
};

export function addSemanticEntitiesToVisualModelAction(
    notifications: UseNotificationServiceWriterType,
    graph: ModelGraphContextType,
    classes: ClassesContextType,
    visualModel: WritableVisualModel,
    diagram: UseDiagramType,
    entities: EntityToAddToVisualModel[],
  ) {
    // TODO RadStr: Again the XY type
    const validatedEntitiesToAddToVisualModel: {
        entityIdentifier: string,
        model: EntityModel,
        position: { x: number, y: number } | null,
    }[] = [];

    for (const entityToAddToVisualModel of entities) {
        const entityIdentifier = entityToAddToVisualModel.identifier;
        const position = entityToAddToVisualModel.position ?? null;

        const model = sourceModelOfEntity(entityIdentifier, [...graph.models.values()]);
        if(model === undefined) {
            // Note that we continue, therefore if one entity fails, the addition of rest is not affected.
            notifications.error(`The entity ${entityIdentifier} which should have been added to visual model doesn't have source semantic model`);
            continue;
        }

        validatedEntitiesToAddToVisualModel.push({entityIdentifier, model, position});
    }

    validatedEntitiesToAddToVisualModel.forEach(({entityIdentifier, model, position}) => {
        const entity = model.getEntities()[entityIdentifier];
        const modelIdentifier = model.getId();
        if(isSemanticModelClass(entity)) {
            addSemanticClassToVisualModelAction(notifications, graph, classes, visualModel, diagram, entityIdentifier, modelIdentifier, position);
        }
        else if(isSemanticModelClassUsage(entity)) {
            addSemanticClassProfileToVisualModelAction(notifications, graph, classes, visualModel, diagram, entityIdentifier, modelIdentifier, position);
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
    });
}