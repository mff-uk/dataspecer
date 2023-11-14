import {CimAdapter, IriProvider} from "@dataspecer/core/cim";
import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";
import {OFN, XSD} from "./vocabulary";
import {PimClass} from "@dataspecer/core/pim/model/pim-class";
import {CoreResource, ReadOnlyMemoryStore} from "@dataspecer/core/core";
import {CoreResourceReader} from "@dataspecer/core/core/core-reader";
import { WdConnector } from "./connector/wd-connector";
import { IHierarchyResponse } from "./connector/response";
import { loadWikidataClass } from "./entity-adapters/wd-class-adapter";
import { cimIriToEntityId } from "./entity-adapters/wd-entity-adapter";
import { EntityId } from "./connector/entities/wd-entity";
import { IWdClass } from "./connector/entities/wd-class";

export class WikidataAdapter implements CimAdapter {
    protected readonly httpFetch: HttpFetch;
    protected iriProvider!: IriProvider;
    protected readonly connector: WdConnector;
    
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

    async search(searchString: string): Promise<PimClass[]> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }
        const results = []
        const searchResponse = await this.connector.search(searchString);
        if (searchResponse != null) {
            for (const cls of searchResponse.results.classes) {
                const newPimClass = loadWikidataClass(cls, this.iriProvider);
                results.push(newPimClass);
            }
        }
        return results;
    }

    async getClass(cimIri: string): Promise<PimClass | null> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }
        const getClassResponse = await this.connector.getClass(cimIriToEntityId(cimIri));
        if (getClassResponse != null && getClassResponse.results.classes.length != 0) {
                const cls = getClassResponse.results.classes[0];
                return loadWikidataClass(cls, this.iriProvider);
        }
        return null;
    }
    
    async getFullHierarchy(cimIri: string): Promise<CoreResourceReader> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }

        const hierarchyResponse = await this.connector.hierarchy(cimIriToEntityId(cimIri));
        if (hierarchyResponse != null) {
            const [resources, _] = this.loadParentsChildrenHierarchy(hierarchyResponse);
            return ReadOnlyMemoryStore.create(resources);
        }
        return ReadOnlyMemoryStore.create({});
    }

    // @todo implement
    async getSurroundings(cimIri: string): Promise<CoreResourceReader> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }
        return ReadOnlyMemoryStore.create({});
    }


    async getResourceGroup(cimIri: string): Promise<string[]> {
        // Keep as is
        return [];
    }

    private loadParentsChildrenHierarchy(hierarchyResponse: IHierarchyResponse): [{ [iri: string]: CoreResource }, Set<EntityId>] {
        // Outputs 
        const resources: { [iri: string]: CoreResource } = {}
        const loadedClassesSet = new Set<number>();

        // Load root
        this.tryLoadClassesFromHierarchy([hierarchyResponse.results.root], resources, loadedClassesSet);

        // Load parents
        this.tryLoadClassesFromHierarchy(hierarchyResponse.results.parents, resources, loadedClassesSet);

        // Load children
        this.tryLoadClassesFromHierarchy(hierarchyResponse.results.children, resources, loadedClassesSet);

        return [resources, loadedClassesSet];
    }

    private tryLoadClassesFromHierarchy(wdClasses: IWdClass[], resources: { [iri: string]: CoreResource }, loadedClassesSet: Set<number>): void {
        for (const cls of wdClasses) {
            if (!loadedClassesSet.has(cls.id)) {
                const newPimClass = loadWikidataClass(cls, this.iriProvider)
                loadedClassesSet.add(cls.id);
                resources[newPimClass.iri] = newPimClass;
            } 
        } 
    }

}
