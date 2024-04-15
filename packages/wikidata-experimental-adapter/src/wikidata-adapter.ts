import {CimAdapter, IriProvider} from "@dataspecer/core/cim";
import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";
import {OFN, XSD} from "./vocabulary";
import {PimClass} from "@dataspecer/core/pim/model/pim-class";
import {CoreResource, ReadOnlyMemoryStore} from "@dataspecer/core/core";
import {CoreResourceReader} from "@dataspecer/core/core/core-reader";
import { WdConnector } from "./wikidata-backend-connector/wd-connector";
import { loadWikidataClass } from "./wikidata-to-dataspecer-entity-adapters/wd-class-adapter";
import { isErrorResponse } from "./wikidata-backend-connector/api-types/error";
import { EntityId, EntityIdsList, wdIriToNumId } from "./wikidata-entities/wd-entity";
import { ClassHierarchy } from "./wikidata-backend-connector/api-types/get-class-hierarchy";
import { WdClassHierarchyDescOnly } from "./wikidata-entities/wd-class";

export class WikidataAdapter implements CimAdapter {
    protected readonly httpFetch: HttpFetch;
    protected iriProvider!: IriProvider;
    protected readonly connector: WdConnector;
    protected static readonly URI_REGEXP = new RegExp('^https?://www.wikidata.org/(entity|wiki)/[QP][1-9][0-9]*$');
    
    constructor(httpFetch: HttpFetch) {
        this.httpFetch = httpFetch;
        this.connector = new WdConnector(this.httpFetch);
    }

    setIriProvider(iriProvider: IriProvider): void {
        this.iriProvider = iriProvider;
    }

    /**
     * Maps IRI to a datatype used in Dataspecer. If the IRI does not represent a datatype, undefined is returned.
     * If the datatype is unknown, null is returned.
     */
    protected mapDatatype(iri: string): string | null | undefined {
        const mapping = {
            [XSD.boolean]: OFN.boolean,
            [XSD.date]: OFN.date,
            [XSD.time]: OFN.time,
            [XSD.dateTimeStamp]: OFN.dateTime,
            [XSD.integer]: OFN.integer,
            [XSD.decimal]: OFN.decimal,
            [XSD.anyURI]: OFN.url,
            [XSD.string]: OFN.string,
        }

        if (Object.hasOwn(mapping, iri)) {
            return mapping[iri];
        }

        return undefined;
    }

    async search(query: string): Promise<PimClass[]> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }

        const results: PimClass[] = []
        const response = await this.connector.getSearch(query);
        if (!isErrorResponse(response)) {
            for (const cls of response.classes) {
                results.push(loadWikidataClass(cls, this.iriProvider));
            }
        }
        return results;
    }

    async getClass(cimIri: string): Promise<PimClass | null> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }
        
        let result: PimClass | null = null;
        if (WikidataAdapter.URI_REGEXP.test(cimIri)) {
            const response = await this.connector.getSearch(cimIri);
            if (!isErrorResponse(response) && response.classes.length === 1) {
                const cls = response.classes[0];
                result = loadWikidataClass(cls, this.iriProvider);
            }
        }
        return result;
    }
    
    async getFullHierarchy(cimIri: string): Promise<CoreResourceReader> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }

        if (WikidataAdapter.URI_REGEXP.test(cimIri)) {
            const response = await this.connector.getClassHierarchy(wdIriToNumId(cimIri), 'full');
            if (!isErrorResponse(response)) {
                const resources = this.loadParentsChildrenHierarchy(response);
                return ReadOnlyMemoryStore.create(resources);
            }
        }
        return ReadOnlyMemoryStore.create({});
    }

    // This method should not be called, the surroundings have different dialog to handle surroundings.
    async getSurroundings(cimIri: string): Promise<CoreResourceReader> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }

        throw new Error("Not not implemented.");
        // return ReadOnlyMemoryStore.create({});
    }


    async getResourceGroup(cimIri: string): Promise<string[]> {
        // Keep as is
        return [];
    }

    private loadParentsChildrenHierarchy(response: ClassHierarchy): { [iri: string]: CoreResource } {
        const resources: { [iri: string]: CoreResource } = {}
        const loadedClassesSet = new Set<EntityId>();

        // Load start class
        this.tryLoadClassesToResources([response.startClassId], resources, loadedClassesSet, response.classesMap);

        // Load parents
        this.tryLoadClassesToResources(response.parentsIds, resources, loadedClassesSet, response.classesMap);

        // Load children
        this.tryLoadClassesToResources(response.childrenIds, resources, loadedClassesSet, response.classesMap);

        return resources;
    }

    private tryLoadClassesToResources(classesIds: EntityIdsList, resources: { [iri: string]: CoreResource }, loadedClassesSet: Set<EntityId>, contextClasses: ReadonlyMap<EntityId, WdClassHierarchyDescOnly>): void {
        for (const clsId of classesIds) {
            if (!loadedClassesSet.has(clsId)) {
                loadedClassesSet.add(clsId);
                const cls = contextClasses.get(clsId) as WdClassHierarchyDescOnly;
                const newPimClass = loadWikidataClass(cls, this.iriProvider, contextClasses)
                resources[newPimClass.iri] = newPimClass;
            } 
        } 
    }
}
