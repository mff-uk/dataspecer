import { Entities, Entity, EntityModel } from "../entity-model";

/**
 * Provides entities as semantic model.
 *
 * It translates generic entities and interprets them as semantic entities.
 *
 * Todo: the translation is identity now, but it should be more complex
 */
export class SemanticModelAdapter implements EntityModel {
    constructor(protected readonly entityModel: EntityModel) {}

    getId(): string {
        return this.entityModel.getId();
    }

    getEntities(): Entities {
        return this.entityModel.getEntities();
    }

    subscribeToChanges(callback: (updated: Record<string, Entity>, removed: string[]) => void): () => void {
        return this.entityModel.subscribeToChanges(callback);
    }
}
