import {SemanticModelClass} from "../concepts/concepts";
import {classQuery, classSurroundingsQuery, searchQuery, SearchQueryEntity} from "../async-queryable/queries";
import {AsyncQueryableEntityModel, AsyncQueryableObservableEntityModel} from "../../entity-model/async-queryable/model";
import {Entity} from "../../entity-model";
import {EntityModel} from "../../entity-model/model";

export class ExternalSemanticModel implements EntityModel {
    private model: AsyncQueryableEntityModel;
    private observableModel: AsyncQueryableObservableEntityModel;

    constructor(model: AsyncQueryableEntityModel, observableModel: AsyncQueryableObservableEntityModel) {
        this.model = model;
        this.observableModel = observableModel;
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

    async allowClass(iri: string) {
        const query = classQuery(iri);
        await this.observableModel.addQuery(query);
    }

    async releaseClass(iri: string) {
        const query = classQuery(iri);
        await this.observableModel.releaseQuery(query);
    }

    async allowClassSurroundings(iri: string) {
        const query = classSurroundingsQuery(iri);
        await this.observableModel.addQuery(query);
    }

    async releaseClassSurroundings(iri: string) {
        const query = classSurroundingsQuery(iri);
        await this.observableModel.releaseQuery(query);
    }
}