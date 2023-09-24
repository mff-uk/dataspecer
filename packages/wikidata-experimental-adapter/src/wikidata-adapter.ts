import jsStringEscape from "js-string-escape";
import search from "./sparql-queries/search.sparql";
import getClass from "./sparql-queries/get-class.sparql";
import getSurroundingsParents from "./sparql-queries/get-surroundings-parents.sparql";
import getSurroundingsChildren from "./sparql-queries/get-surroundings-children.sparql";
import {CimAdapter, IriProvider} from "@dataspecer/core/cim";
import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";
import {OFN, XSD, WIKIDATA_ENTITY_PREFIX, WIKIDATA_SPARQL_FREE_VAR_PREFIX, RDFS} from "./vocabulary";
import {PimClass} from "@dataspecer/core/pim/model/pim-class";
import {CoreResource, ReadOnlyMemoryStore} from "@dataspecer/core/core";
import {CoreResourceReader} from "@dataspecer/core/core/core-reader";
import { RdfSource, RdfSourceWrap } from "@dataspecer/core/core/adapter/rdf";
import { SparqlQueryRdfSource } from "@dataspecer/core/io/rdf/sparql/sparql-query-rdf-source";
import { loadWikidataItem } from "./entity-adapters/sparql-wikidata-item-adapter";
import { FederatedSource } from "@dataspecer/core/io/rdf/federated/federated-rdf-source";

const getChildrenParents = [
     getSurroundingsChildren,
     getSurroundingsParents
];

const searchQuery = (searchString: string) => search({query: `"${jsStringEscape(searchString)}"`});

const getClassQuery = (cimIri: string) => getClass({class: `<${cimIri}>`});

const getChildrenParentsQuery = (cimIri: string) => getChildrenParents.map(q => q({class: `<${cimIri}>`}));

const IRI_REGEXP = new RegExp("^" + WIKIDATA_ENTITY_PREFIX + "[QP][1-9][0-9]*$");

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
        console.log(searchString);
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
        
        console.log(results.length);
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
            }
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

        const results = await source.property(
            this.varToWikidataSparqlVar("__search_results"),
            this.varToWikidataSparqlVar("__has_search_result")
        );

        if (results.length !== 1) {
            return null;
        } else {
            const resultWrap = RdfSourceWrap.forIri(results[0].value, source);
            return await loadWikidataItem(resultWrap, this.iriProvider);
        }
    }

    // @todo implement
    async getSurroundings(cimIri: string): Promise<CoreResourceReader> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }
        
        const sources = getChildrenParentsQuery(cimIri).map(
            (query) => new SparqlQueryRdfSource(this.httpFetch, this.WIKIDATA_SPARQL_ENDPOINT, query)
        );
        await Promise.all(sources.map((q) => q.query()));
        const source = FederatedSource.createExhaustive(sources);
        const resources = await this.loadChildrenAndParentsFromEntity(cimIri, source);
        return ReadOnlyMemoryStore.create(resources);
    }

    async getFullHierarchy(cimIri: string): Promise<CoreResourceReader> {
        // Keep as is
        return ReadOnlyMemoryStore.create({});;
    }

    async getResourceGroup(cimIri: string): Promise<string[]> {
        // Keep as is
        return [];
    }

    protected varToWikidataSparqlVar(variable: string): string {
        return WIKIDATA_SPARQL_FREE_VAR_PREFIX + variable;
    }

    protected async loadChildrenAndParentsFromEntity(
        rootClassCimIri: string,
        source: RdfSource
      ): Promise<{ [iri: string]: CoreResource }> {
        const resources: { [iri: string]: CoreResource } = {};
       
        const parentsCimIris = (await source.property(rootClassCimIri, RDFS.subClassOf)).map((r) => r.value);
        const childrenCimIris = (await source.reverseProperty(RDFS.subClassOf, rootClassCimIri)).map((r) => r.value);
        const cimIrisToProcess = [...new Set([...parentsCimIris, ...childrenCimIris])];

        console.log("parents and children");
        console.log(parentsCimIris);

        const classesProcessed = new Set<string>();
        while (cimIrisToProcess.length) {
            const processedCimIri = cimIrisToProcess.pop();
            if (classesProcessed.has(processedCimIri)) {
                continue;
            }

            const rdfClassWrap = RdfSourceWrap.forIri(processedCimIri, source);
            const pimClass = await loadWikidataItem(rdfClassWrap, this.iriProvider);
            resources[pimClass.iri] = pimClass;
        }
        console.log(resources);
        return resources;
    }
}
