import {AsyncQueryableEntityModel, AsyncQueryableObservableEntityModel} from "./model";
import {Entity} from "../entity";
import {InMemoryEntityModel} from "../implementation";

export class SimpleAsyncQueryableObservableEntityModel extends InMemoryEntityModel implements AsyncQueryableObservableEntityModel {
    protected model: AsyncQueryableEntityModel;
    protected queries: Record<string, any> = {};
    protected reverseQueries: Map<string, string[]> = new Map();

    protected addToReverseQueries(entityIri: string, queryIri: string): void {
        if (!this.reverseQueries.has(entityIri)) {
            this.reverseQueries.set(entityIri, []);
        }
        const queries = this.reverseQueries.get(entityIri)!;
        if (!queries.includes(queryIri)) {
            queries.push(queryIri);
        }
    }

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
        const iris = Object.keys(result);
        const addedIris: Record<string, Entity> = {};

        for (const iri of iris) {
            if (!this.reverseQueries.has(iri)) {
                this.reverseQueries.set(iri, []);
            }
            const queries = this.reverseQueries.get(iri)!;
            if (!queries.includes(queryIri)) {
                if (queries.length == 0) {
                    addedIris[iri] = result[iri];
                }
                queries.push(queryIri);
            }
        }

        this.change(addedIris, []);
    }

    async releaseQuery(queryIri: string): Promise<void> {
        if (!this.queries[queryIri]) {
            // Do nothing, because the query is not present
            return;
        }

        const iris = Object.keys(this.queries[queryIri]);
        const removedIris: string[] = [];
        for (const iri of iris) {
            let queries = this.reverseQueries.get(iri)!;
            queries = queries.filter(q => q !== queryIri);
            if (queries.length === 0) {
                this.reverseQueries.delete(iri);
                removedIris.push(iri);
            } else {
                this.reverseQueries.set(iri, queries);
            }
        }

        delete this.queries[queryIri];

        this.change({}, removedIris);
    }

}