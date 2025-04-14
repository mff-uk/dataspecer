import { CimAdapter, IriProvider } from "@dataspecer/core/cim";
import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";
import { PimClass } from "@dataspecer/core/pim/model/pim-class";
import { CoreResource, ReadOnlyMemoryStore } from "@dataspecer/core/core";
import { CoreResourceReader } from "@dataspecer/core/core/core-reader";
import { WdEntityId, WdEntityIdsList, WdEntityIri, wdIriToNumId } from "./wikidata-entities/wd-entity.ts";
import { WdClassHierarchyDescOnly } from "./wikidata-entities/wd-class.ts";
import { WdPropertyDescOnly } from "./wikidata-entities/wd-property.ts";
import { loadWikidataAssociation, loadWikidataAttribute } from "./wikidata-to-dataspecer-entity-adapters/wd-property-adapter.ts";
import { PimAttribute } from "@dataspecer/core/pim/model/pim-attribute";
import { PimAssociation } from "@dataspecer/core/pim/model/pim-association";
import { WdOntologyConnector } from "./wikidata-ontology-connector/wd-ontology-connector.ts";
import { isWdErrorResponse } from "./wikidata-ontology-connector/api-types/error.ts";
import { WdClassHierarchy } from "./wikidata-ontology-connector/api-types/get-class-hierarchy.ts";
import { loadWikidataClass } from "./wikidata-to-dataspecer-entity-adapters/wd-class-adapter.ts";
import { WdSparqlEndpointConnector } from "./wikidata-sparql-endpoint-connector/wd-sparql-endpoint-connector.ts";

export function isWikidataAdapter(adapter: CimAdapter): adapter is WikidataAdapter {
    return Object.hasOwn(adapter, "thisIsWikidataAdapter");
}

export class WikidataAdapter implements CimAdapter {
    protected readonly httpFetch: HttpFetch;
    protected iriProvider!: IriProvider;
    public static readonly ENTITY_URI_REGEXP = new RegExp(
        "^https?://www.wikidata.org/(entity|wiki)/Q[1-9][0-9]*$",
    );
    public readonly wdOntologyConnector: WdOntologyConnector;
    public readonly wdSparqlEndpointConnector: WdSparqlEndpointConnector;
    // For type narrowing
    public readonly thisIsWikidataAdapter: boolean = true;

    constructor(httpFetch: HttpFetch, baseUrl: string) {
        this.httpFetch = httpFetch;
        this.wdOntologyConnector = new WdOntologyConnector(this.httpFetch, baseUrl);
        this.wdSparqlEndpointConnector = new WdSparqlEndpointConnector(this.httpFetch);
    }

    setIriProvider(iriProvider: IriProvider): void {
        this.iriProvider = iriProvider;
    }

    async search(query: string): Promise<PimClass[]> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }

        const results: PimClass[] = [];
        const response = await this.wdOntologyConnector.getSearch(query);
        if (!isWdErrorResponse(response)) {
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
        if (WikidataAdapter.ENTITY_URI_REGEXP.test(cimIri)) {
            const response = await this.wdOntologyConnector.getSearch(cimIri);
            if (!isWdErrorResponse(response) && response.classes.length === 1) {
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

        if (WikidataAdapter.ENTITY_URI_REGEXP.test(cimIri)) {
            const response = await this.wdOntologyConnector.getClassHierarchy(wdIriToNumId(cimIri), "full");
            if (!isWdErrorResponse(response)) {
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

    private loadParentsChildrenHierarchy(response: WdClassHierarchy): {
        [iri: string]: CoreResource;
    } {
        const resources: { [iri: string]: CoreResource } = {};
        const loadedClassesSet = new Set<WdEntityId>();

        // Load start class
        this.tryLoadClassesToResources(
            [response.startClassId],
            resources,
            loadedClassesSet,
            response.classesMap,
        );

        // Load parents
        this.tryLoadClassesToResources(
            response.parentsIds,
            resources,
            loadedClassesSet,
            response.classesMap,
        );

        // Load children
        this.tryLoadClassesToResources(
            response.childrenIds,
            resources,
            loadedClassesSet,
            response.classesMap,
        );

        return resources;
    }

    public tryLoadClassesToResources(
        classesIds: WdEntityIdsList,
        resources: { [iri: string]: CoreResource },
        loadedClassesSet: Set<WdEntityId>,
        contextClasses: ReadonlyMap<WdEntityId, WdClassHierarchyDescOnly>,
    ): void {
        for (const clsId of classesIds) {
            if (!loadedClassesSet.has(clsId)) {
                loadedClassesSet.add(clsId);
                const cls = contextClasses.get(clsId) as WdClassHierarchyDescOnly;
                const newPimClass = loadWikidataClass(cls, this.iriProvider, contextClasses);
                resources[newPimClass.iri] = newPimClass;
            }
        }
    }

    public tryLoadClassToResource(
        cls: WdClassHierarchyDescOnly,
        resources: { [iri: string]: CoreResource },
        loadedClassesSet: Set<WdEntityId>,
    ): void {
        if (!loadedClassesSet.has(cls.id)) {
            loadedClassesSet.add(cls.id);
            const newPimClass = loadWikidataClass(cls, this.iriProvider);
            resources[newPimClass.iri] = newPimClass;
        }
    }

    public tryLoadAssociationToResource(
        property: WdPropertyDescOnly,
        subjectClass: WdClassHierarchyDescOnly,
        objectClass: WdClassHierarchyDescOnly,
        isInward: boolean,
        resources: { [iri: string]: CoreResource },
        loadedPropertiesSet: Set<WdEntityIri>,
    ): PimAssociation | undefined {
        const [pimMediate1, pimAssociation, pimMediate2] = loadWikidataAssociation(property, subjectClass, objectClass, isInward, this.iriProvider);
        if (!loadedPropertiesSet.has(pimAssociation.iri)) {
            loadedPropertiesSet.add(pimAssociation.iri);
            resources[pimAssociation.iri] = pimAssociation;
            resources[pimMediate1.iri] = pimMediate1;
            resources[pimMediate2.iri] = pimMediate2;
            return pimAssociation;
        }
        return undefined;
    }

    public tryLoadAttributeToResource(
        property: WdPropertyDescOnly,
        subjectClass: WdClassHierarchyDescOnly,
        resources: { [iri: string]: CoreResource },
        loadedPropertiesSet: Set<WdEntityIri>,
    ): PimAttribute | undefined {
        const pimAttribute= loadWikidataAttribute(property, subjectClass, this.iriProvider);
        if (!loadedPropertiesSet.has(pimAttribute.iri)) {
            loadedPropertiesSet.add(pimAttribute.iri);
            resources[pimAttribute.iri] = pimAttribute;
            return pimAttribute;
        }
        return undefined;
    }
}
