import {SemanticModelClass} from "../concepts/concepts";
import {classQuery, classSurroundingsQuery, searchQuery, SearchQueryEntity} from "../async-queryable/queries";
import {AsyncQueryableEntityModel, AsyncQueryableObservableEntityModel} from "../../entity-model/async-queryable/model";
import {Entity} from "../../entity-model";
import {EntityModel} from "../../entity-model/entity-model";
import {SimpleAsyncQueryableObservableEntityModel} from "../../entity-model/async-queryable/implementation";

export class ExternalSemanticModel implements EntityModel {
    private model: AsyncQueryableEntityModel;
    private observableModel: AsyncQueryableObservableEntityModel;

    constructor(model: AsyncQueryableEntityModel, observableModel: AsyncQueryableObservableEntityModel) {
        this.model = model;
        this.observableModel = observableModel;
    }

    serializeModel() {
        return {
            // todo fix
            type: "https://dataspecer.com/core/model-descriptor/sgov",
            queries: Object.keys((this.observableModel as SimpleAsyncQueryableObservableEntityModel).queries)
        };
    }

    async unserializeModel(data: object) {
        const modelDescriptor = data as any;
        const queries = modelDescriptor.queries as string[];
        for (const query of queries) {
            await this.observableModel.addQuery(query);
        }
    }

    getEntities(): Record<string, Entity> {
        return this.observableModel.getEntities();
    }
    subscribeToChanges(callback: (updated: Record<string, Entity>, removed: string[]) => void): () => void {
        return this.observableModel.subscribeToChanges(callback);
    }

    /**
     * Searches for a given string and returns a list of classes that were found.
     * @param query search string, may contain regex if supported
     */
    async search(query: string): Promise<SemanticModelClass[]> {
        const iri = searchQuery(query);
        const result = await this.model.query(iri);
        const searchQueryEntity = result[iri] as SearchQueryEntity;
        return searchQueryEntity.order.map<SemanticModelClass>(iri => result[iri] as SemanticModelClass);
    }

    async allowClass(id: string) {
        const query = classQuery(id);
        await this.observableModel.addQuery(query);
    }

    async releaseClass(id: string) {
        const query = classQuery(id);
        await this.observableModel.releaseQuery(query);
    }

    async allowClassSurroundings(id: string) {
        const query = classSurroundingsQuery(id);
        await this.observableModel.addQuery(query);
    }

    async releaseClassSurroundings(id: string) {
        const query = classSurroundingsQuery(id);
        await this.observableModel.releaseQuery(query);
    }
}