import {Entity} from "../entity";
import {EntityModel} from "../entity-model";

/**
 * Model that contains entities and can be queried. An example is a large conceptual model that is in non-dataspecer
 * format. Then we may call queries such as "search classes such ...", "get class surroundings", etc.
 */
export interface AsyncQueryableEntityModel {
    query(queryIri: string): Promise<Record<string, Entity>> | Record<string, Entity>;
}

export interface AsyncQueryableObservableEntityModel extends EntityModel {
    /**
     * Adds queries that are requested from the external model.
     */
    addQuery(queryIri: string): Promise<void>;

    /**
     * Removes queries that are no longer requested from the external model.
     */
    releaseQuery(queryIri: string): Promise<void>;
}