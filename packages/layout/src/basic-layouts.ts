import { ExtractedModel, extractModelObjects } from "./layout-iface";
import { SemanticModelEntity, isSemanticModelClass, isSemanticModelRelationship, isSemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualEntities, VisualEntity } from "../../core-v2/lib/visual-model/visual-entity";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";


export async function doRandomLayout(inputSemanticModel: Record<string, SemanticModelEntity>): Promise<VisualEntities> {
    const { entities, classes, classesProfiles, relationships, relationshipsProfiles, generalizations } = extractModelObjects(inputSemanticModel);

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

export interface BlockLayoutOptions {
    colCount: number, 
    rowJump: number, 
    colJump: number
}

export async function doBlockLayout(inputSemanticModel: Record<string, SemanticModelEntity>, options: BlockLayoutOptions): Promise<VisualEntities> {
    const { entities, classes, classesProfiles, relationships, relationshipsProfiles, generalizations } = extractModelObjects(inputSemanticModel);

    let currRow: number = 0;
    let currCol: number = -1;    

    const visualEntities = classes.map(cls => {        
        currCol++;
        if (currCol % options.colCount == 0) {
            currCol = 0;
            currRow++;
        }   

        return {
            id: Math.random().toString(36).substring(2), // random unique id of visual entity
            type: ["visual-entity"], // type of visual entity, keep it as is
            sourceEntityId: cls.id, // id of the class you want to visualize
            visible: true,
            position: { x: currCol * options.colJump, y: currRow * options.rowJump },
            hiddenAttributes: [],
        } as VisualEntity
    });

    return Object.fromEntries(visualEntities.map(entity => [entity.sourceEntityId, entity])) as VisualEntities;
}