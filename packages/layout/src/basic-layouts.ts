import { ExtractedModel, LayoutAlgorithm, extractModelObjects } from "./layout-iface";
import { SemanticModelEntity, isSemanticModelClass, isSemanticModelRelationship, isSemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualEntities, VisualEntity } from "../../core-v2/lib/visual-model/visual-entity";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { ConstraintContainer } from "./configs/constraint-container";
import { NodeDimensionQueryHandler } from ".";


export async function doRandomLayoutAdvanced(extractedModel: ExtractedModel): Promise<VisualEntities> {
    // TODO: Only classes
    const { entities, classes, classesProfiles, relationships, relationshipsProfiles, generalizations } = extractedModel;

    const visualEntities = classes.map(cls => ({
        id: Math.random().toString(36).substring(2), // Random unique id of visual entity
        type: ["visual-entity"], // Type of visual entity, keep it as is
        sourceEntityId: cls.id, // ID of the class you want to visualize
        visible: true,
        position: { x: Math.ceil(Math.random() * 300 * Math.sqrt(classes.length)), y: Math.ceil(Math.random() * 150 * Math.sqrt(classes.length)) },
        hiddenAttributes: [],
    } as VisualEntity));

    console.log(visualEntities);

    return Object.fromEntries(visualEntities.map(entity => [entity.sourceEntityId, entity])) as VisualEntities;
}

export class RandomLayout implements LayoutAlgorithm {
    // TODO: This is cool and all but 2 problems:
    //       1) Working with extractedModel and I store it in the prepare method, think about it if I shouldn't work with the graph instead (but this is kinda special case)
    //       2) Doesn't enforce Constraints from constraintContainer
    prepare(extractedModel: ExtractedModel, constraintContainer: ConstraintContainer, nodeDimensionQueryHandler: NodeDimensionQueryHandler): void {
        this.extractedModel = extractedModel;
        this.constraintContainer = constraintContainer;
        this.nodeDimensionQueryHandler = nodeDimensionQueryHandler;
    }

    run(): Promise<VisualEntities> {
        return doRandomLayoutAdvanced(this.extractedModel);
    }
    stop(): void {
        throw new Error("TODO: Implement me if you want webworkers and parallelization");
    }

    extractedModel: ExtractedModel;
    constraintContainer: ConstraintContainer;
    nodeDimensionQueryHandler: NodeDimensionQueryHandler;
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
            id: Math.random().toString(36).substring(2),
            type: ["visual-entity"],
            sourceEntityId: cls.id,
            visible: true,
            position: { x: currCol * options.colJump, y: currRow * options.rowJump },
            hiddenAttributes: [],
        } as VisualEntity
    });

    return Object.fromEntries(visualEntities.map(entity => [entity.sourceEntityId, entity])) as VisualEntities;
}