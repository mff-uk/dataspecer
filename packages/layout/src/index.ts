import { SemanticModelEntity, isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualEntities, VisualEntity } from "../../core-v2/lib/visual-model/visual-entity";

export async function doLayout(inputSemanticModel: Record<string, SemanticModelEntity>): Promise<VisualEntities> {
    return doRandomLayout(inputSemanticModel);
}

async function doRandomLayout(inputSemanticModel: Record<string, SemanticModelEntity>): Promise<VisualEntities> {
    const entities = Object.values(inputSemanticModel);
    const classes = entities.filter(isSemanticModelClass);

    const visualEntities = classes.map(cls => ({
        id: Math.random().toString(36).substring(2), // random unique id of visual entity
        type: ["visual-entity"], // type of visual entity, keep it as is
        sourceEntityId: cls.id, // id of the class you want to visualize
        visible: true,
        position: { x: Math.random() * 800, y: Math.random() * 800 },
        hiddenAttributes: [],
    } as VisualEntity));

    return Object.fromEntries(visualEntities.map(entity => [entity.sourceEntityId, entity])) as VisualEntities;
}