import {AsyncQueryableEntityModel, AsyncQueryableObservableEntityModel} from "./model";
import {Entity} from "../entity";
import {InMemoryEntityModel} from "../implementation";

export class SimpleAsyncQueryableObservableEntityModel extends InMemoryEntityModel implements AsyncQueryableObservableEntityModel {
    protected model: AsyncQueryableEntityModel;
    protected queries: Record<string, any> = {};
    protected reverseQueries: Map<string, string[]> = new Map();

    constructor(queryableModel: AsyncQueryableEntityModel) {
        super();
        this.model = queryableModel;
    }

    async addQuery(queryIri: string): Promise<void> {
        if (this.queries[queryIri]) {
            // Do nothing, because the query is present
            return;
        }
        const result = await this.model.query(queryIri);
        if (this.queries[queryIri]) {
            // Do nothing, because the query is present
            return;
        }

        this.queries[queryIri] = result;
        const ids = Object.keys(result);
        const addedIds: Record<string, Entity> = {};

        for (const id of ids) {
            if (!this.reverseQueries.has(id)) {
                this.reverseQueries.set(id, []);
            }
            const queries = this.reverseQueries.get(id)!;
            if (!queries.includes(queryIri)) {
                if (queries.length == 0) {
                    addedIds[id] = result[id];
                }
                queries.push(queryIri);
            }
        }

        this.change(addedIds, []);
    }

    async releaseQuery(queryIri: string): Promise<void> {
        if (!this.queries[queryIri]) {
            // Do nothing, because the query is not present
            return;
        }

        const ids = Object.keys(this.queries[queryIri]);
        const removedIds: string[] = [];
        for (const id of ids) {
            let queries = this.reverseQueries.get(id)!;
            queries = queries.filter(q => q !== queryIri);
            if (queries.length === 0) {
                this.reverseQueries.delete(id);
                removedIds.push(id);
            } else {
                this.reverseQueries.set(id, queries);
            }
        }

        delete this.queries[queryIri];

        this.change({}, removedIds);
    }

}