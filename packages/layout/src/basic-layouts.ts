import { ExtractedModel, extractModelObjects } from "./layout-iface";
import { SemanticModelEntity, isSemanticModelClass, isSemanticModelRelationship, isSemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualEntity, VisualNode } from "../../core-v2/lib/visual-model/visual-entity";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { VisualEntities } from "./migration-to-cme-v2";

// TODO" The given simple implementation - can be improved (by at least considering profiles)
export async function doRandomLayout(inputSemanticModel: Record<string, SemanticModelEntity>): Promise<VisualEntities> {
    const { entities, classes, classesProfiles, relationships, relationshipsProfiles, generalizations } = extractModelObjects(inputSemanticModel);

    const visualEntities = classes.map(cls => ({
        identifier: Math.random().toString(36).substring(2), // random unique id of visual entity
        type: ["visual-entity"], // type of visual entity, keep it as is
        representedEntity: cls.id, // id of the class you want to visualize
        model: Object.keys(inputSemanticModel)[0],
        position: {
            x: Math.random() * 800,
            y: Math.random() * 800,
            anchored: null
        },
        content: [],    // What is this?
        visualModels: [],
    } as VisualNode));

    return Object.fromEntries(visualEntities.map(entity => [entity.representedEntity, entity])) as VisualEntities;
}

export async function doRandomLayoutAdvanced(inputSemanticModel: Record<string, SemanticModelEntity>): Promise<VisualEntities> {
    console.log("RANDOM");
    const { entities, classes, classesProfiles, relationships, relationshipsProfiles, generalizations } = extractModelObjects(inputSemanticModel);

    const visualEntities = classes.map(cls => ({
        identifier: Math.random().toString(36).substring(2), // random unique id of visual entity
        type: ["visual-entity"], // type of visual entity, keep it as is
        representedEntity: cls.id, // id of the class you want to visualize
        model: Object.keys(inputSemanticModel)[0],
        position: {
            x: Math.ceil(Math.random() * 300 * Math.sqrt(classes.length)),
            y: Math.ceil(Math.random() * 150 * Math.sqrt(classes.length)),
            anchored: null
        },
        content: [],
        visualModels: [],
    } as VisualNode));

    console.log(visualEntities);

    return Object.fromEntries(visualEntities.map(entity => [entity.representedEntity, entity])) as VisualEntities;
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
            identifier: Math.random().toString(36).substring(2), // random unique id of visual entity
            type: ["visual-entity"], // type of visual entity, keep it as is
            representedEntity: cls.id, // id of the class you want to visualize
            model: Object.keys(inputSemanticModel)[0],
            position: {
                x: currCol * options.colJump,
                y: currRow * options.rowJump,
                anchored: null
            },
            content: [],
            visualModels: [],
        } as VisualNode
    });

    return Object.fromEntries(visualEntities.map(entity => [entity.representedEntity, entity])) as VisualEntities;
}