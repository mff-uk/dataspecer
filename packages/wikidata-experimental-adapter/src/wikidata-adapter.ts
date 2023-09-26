import jsStringEscape from "js-string-escape";
import search from "./sparql-queries/search.sparql";
import getClass from "./sparql-queries/get-class.sparql";
import getSurroundingsParents from "./sparql-queries/get-surroundings-parents.sparql";
import getSurroundingsChildren from "./sparql-queries/get-surroundings-children.sparql";
import getSurroundingsOutwardAssociations from "./sparql-queries/get-surroundings-outward-associations.sparql"
import getFullHierarchyChildren from "./sparql-queries/get-full-hierarchy-children.sparql";
import getFullHierarchyParents from "./sparql-queries/get-full-hierarchy-parents.sparql";
import {CimAdapter, IriProvider} from "@dataspecer/core/cim";
import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";
import {OFN, XSD, WIKIDATA_ENTITY_PREFIX, WIKIDATA_SPARQL_FREE_VAR_PREFIX, RDFS} from "./vocabulary";
import {PimClass} from "@dataspecer/core/pim/model/pim-class";
import {CoreResource, ReadOnlyMemoryStore} from "@dataspecer/core/core";
import {CoreResourceReader} from "@dataspecer/core/core/core-reader";
import { RdfSource, RdfSourceWrap } from "@dataspecer/core/core/adapter/rdf";
import { SparqlQueryRdfSource } from "@dataspecer/core/io/rdf/sparql/sparql-query-rdf-source";
import { loadWikidataItem, isWikidataItem } from "./entity-adapters/sparql-wikidata-item-adapter";
import { FederatedSource } from "@dataspecer/core/io/rdf/federated/federated-rdf-source";
import { loadWikidataAssociationOrAttribute } from "./entity-adapters/sparql-wikidata-association-attribute-adapter";

const getSurroundingsParentsAndChilren = [
     getClass,
     getSurroundingsChildren,
     getSurroundingsParents,
];

const getSurroundingsAssociations = [
    getSurroundingsOutwardAssociations,
]

const getFullHierarchy = [
    getClass,
    getFullHierarchyParents,
    //getFullHierarchyChildren,
]

const searchQuery = (searchString: string) => search({query: `"${jsStringEscape(searchString)}"`});

const getClassQuery = (cimIri: string) => getClass({class: `<${cimIri}>`});

const getSurroundingsParentsAndChilrenQuery = (cimIri: string) => getSurroundingsParentsAndChilren.map(q => q({class: `<${cimIri}>`}));

const getFullHierarchyQuery = (cimIri: string) => getFullHierarchy.map(q => q({class: `<${cimIri}>`}));

const getSurroundingsAssociationsQuery = (cimIri: string) => getSurroundingsAssociations.map(q => q({class: `<${cimIri}>`}));

const IRI_REGEXP = new RegExp("^http://www.wikidata.org/entity/Q[1-9][0-9]*$");

export class WikidataAdapter implements CimAdapter {
    protected readonly WIKIDATA_SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";
    protected readonly httpFetch: HttpFetch;
    protected iriProvider!: IriProvider;
    
    constructor(httpFetch: HttpFetch) {
        this.httpFetch = httpFetch;
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

    // @todo implement
    async search(searchString: string): Promise<PimClass[]> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }
        const source = new SparqlQueryRdfSource(
            this.httpFetch,
            this.WIKIDATA_SPARQL_ENDPOINT,
            searchQuery(searchString)
          );
        await source.query();

        const results = await source.property(
            this.varToWikidataSparqlVar("__search_results"),
            this.varToWikidataSparqlVar("__has_search_result")
        );
        
        let sorted = [];
        for (const result of results) {
            const resultWrap = RdfSourceWrap.forIri(result.value, source);
            sorted.push({
              sort: Number((await resultWrap.property(this.varToWikidataSparqlVar("__order")))[0].value),
              cls: await loadWikidataItem(resultWrap, this.iriProvider),
            });
        }
        sorted = sorted.sort((a, b) => a.sort - b.sort).map((p) => p.cls);

        if (IRI_REGEXP.test(searchString)) {
            const classByIri = await this.getClass(searchString);
            if (classByIri) {
              sorted = [classByIri];
            } else sorted = []
        }

        return sorted;
    }

    // @todo implement
    async getClass(cimIri: string): Promise<PimClass | null> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }
        const source = new SparqlQueryRdfSource(
            this.httpFetch,
            this.WIKIDATA_SPARQL_ENDPOINT,
            getClassQuery(cimIri)
        );
        await source.query();

        const resultWrap = RdfSourceWrap.forIri(cimIri, source);
        if (!(await isWikidataItem(resultWrap))) {
            return null;
        }
        return await loadWikidataItem(resultWrap, this.iriProvider);
    }

    //http://www.wikidata.org/entity/Q5
    // @todo implement
    async getSurroundings(cimIri: string): Promise<CoreResourceReader> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }
        
        const [associationsSources, associationsFinishPromise] = 
            this.createGroupQuerySparqlSources(cimIri, getSurroundingsAssociationsQuery);
        const [parentsChildrenSources, parentsChildrenFinishPromise] = 
            this.createGroupQuerySparqlSources(cimIri, getSurroundingsParentsAndChilrenQuery);
        
        // Work on parents because associations queries take longer.
        await parentsChildrenFinishPromise;
        const parentsChildrenSource = FederatedSource.createExhaustive(parentsChildrenSources);
        let resources = await this.loadChildrenAndParentsFromEntity(cimIri, parentsChildrenSource);

        await associationsFinishPromise;
        const associationsSource = FederatedSource.createExhaustive(associationsSources);
        resources = await this.loadAssociationsAndItsTypesFromEntity(cimIri, associationsSource, resources);

        return ReadOnlyMemoryStore.create(resources);
    }

    async getFullHierarchy(cimIri: string): Promise<CoreResourceReader> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }

        const sources = getFullHierarchyQuery(cimIri).map(
            (query) => new SparqlQueryRdfSource(this.httpFetch, this.WIKIDATA_SPARQL_ENDPOINT, query)
        );
        await Promise.all(sources.map((q) => q.query()));
        const source = FederatedSource.createExhaustive(sources);
        const resources = await this.loadChildrenAndParentsFromEntity(cimIri, source);
        return ReadOnlyMemoryStore.create(resources);
    }

    async getResourceGroup(cimIri: string): Promise<string[]> {
        // Keep as is
        return [];
    }

    protected varToWikidataSparqlVar(variable: string): string {
        return WIKIDATA_SPARQL_FREE_VAR_PREFIX + variable;
    }


    protected createGroupQuerySparqlSources(
        cimIri: string,
        groupQuery: (string) => string[]
      ): [SparqlQueryRdfSource[], Promise<void[]>] {
        const sources = groupQuery(cimIri).map(
            (query) => new SparqlQueryRdfSource(this.httpFetch, this.WIKIDATA_SPARQL_ENDPOINT, query)
        );
        const finishPromise = Promise.all(sources.map((q) => q.query()));
        return [sources, finishPromise];
    }

    protected async loadChildrenAndParentsFromEntity(
        rootClassCimIri: string,
        source: RdfSource
      ): Promise<{ [iri: string]: CoreResource }> {
        const resources: { [iri: string]: CoreResource } = {};
        
        const classesProcessed = new Set<string>();
        let cimIrisToProcess = [rootClassCimIri];
        while (cimIrisToProcess.length) {
            const processedCimIri = cimIrisToProcess.pop();
            if (classesProcessed.has(processedCimIri)) { 
                continue;
            } 
            classesProcessed.add(processedCimIri);
            const rdfClassWrap = RdfSourceWrap.forIri(processedCimIri, source);
            if (!(await isWikidataItem(rdfClassWrap))) {
                continue;
            } 
            
            const pimClass = await loadWikidataItem(rdfClassWrap, this.iriProvider);
            
            const parentsCimIris = (await source.property(processedCimIri, RDFS.subClassOf)).map((r) => r.value);
            const childrenCimIris = (await source.reverseProperty(RDFS.subClassOf, processedCimIri)).map((r) => r.value);
            cimIrisToProcess = [...cimIrisToProcess, ...parentsCimIris, ...childrenCimIris];
            
            resources[pimClass.iri] = pimClass;
        }
        return resources;
    }

    protected async loadAssociationsAndItsTypesFromEntity(
        rootClassCimIri: string,
        source: RdfSource,
        resources: { [iri: string]: CoreResource }
      ): Promise<{ [iri: string]: CoreResource }> {
        const processedCLasses = new Set<string>(...Object.keys(resources).map(this.iriProvider.pimToCim));
        const classCimIrisToProcess = []; 

        const associationsResults = await source.property(
            this.varToWikidataSparqlVar("__search_results"),
            this.varToWikidataSparqlVar("__has_search_results")
        );  

        for (const result of associationsResults) {
            const rdfResultWrap = RdfSourceWrap.forIri(result.value, source);
            const [coreResources, newClassIrisToProcess]: [CoreResource[], string[]] 
                = await loadWikidataAssociationOrAttribute(rootClassCimIri, rdfResultWrap, source, this.iriProvider);
            coreResources.forEach((r) => resources[r.iri] = r);
            classCimIrisToProcess.push(newClassIrisToProcess);
        }
        
        console.log(classCimIrisToProcess.length);

        // TODO find classes.

        // test if the resource contains the root.
        console.log(resources[this.iriProvider.cimToPim(rootClassCimIri)]);

        return resources;
    }
}
