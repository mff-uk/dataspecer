import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";
import { WdClassDescOnly } from "../wikidata-entities/wd-class";
import { WdExampleInstance } from "./api-types/get-example-instances";
import { SparqlQueryRdfSource } from "@dataspecer/core/io/rdf/sparql/sparql-query-rdf-source";
import getExampleInstancesChildren from "./sparql-queries/get-example-instances-children.sparql";
import getExampleInstancesAncestors from "./sparql-queries/get-example-instances-ancestors.sparql";
import { RdfSourceWrap } from "@dataspecer/core/core/adapter/rdf/rdf-source-wrap";
import { RDFS } from "../vocabulary";

const getExampleInstancesChildrenQuery = (wdClassIri: string) => getExampleInstancesChildren({ class: `<${wdClassIri}>`});
const getExampleInstancesAncestorsQuery = (wdClassIri: string) => getExampleInstancesAncestors({ class: `<${wdClassIri}>`});

export class WdSparqlEndpointConnector {
    private WIKIDATA_SPARQL_FREE_VAR_PREFIX = "http://query.wikidata.org/bigdata/namespace/wdq/";
    private WIKIDATA_SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";
    protected readonly httpFetch: HttpFetch;

    constructor(httpFetch: HttpFetch) {
        this.httpFetch = httpFetch;
    }

    private freeVarToWikidataVar(freeVar: string): string {
        return this.WIKIDATA_SPARQL_FREE_VAR_PREFIX + freeVar;
    }

    public async getExampleInstances(wdClass: WdClassDescOnly): Promise<WdExampleInstance[]> {
        const childrenResults = this.getExampleInstancesInternal(getExampleInstancesChildrenQuery(wdClass.iri));
        const ancestorsResults = this.getExampleInstancesInternal(getExampleInstancesAncestorsQuery(wdClass.iri));
        const results = [...(await childrenResults), ...(await ancestorsResults)];
        console.log(results);
        console.log(results);
        return results 
    }

    private async getExampleInstancesInternal(query: string): Promise<WdExampleInstance[]> {
        let instanceExamples: WdExampleInstance[] = [];

        const source = new SparqlQueryRdfSource(
            this.httpFetch, 
            this.WIKIDATA_SPARQL_ENDPOINT, 
            query
        );
        await source.query();
        
        const results = await source.property(
            this.freeVarToWikidataVar("__search_results"), 
            this.freeVarToWikidataVar("__has_search_result")
        );

        for await (const result of results) {
            const resultWrap = RdfSourceWrap.forIri(result.value, source);
            const instanceLabels = (await resultWrap.property(RDFS.label)).map((value) => {
                return value.value;
            });
            
            instanceExamples.push({ 
                iri: resultWrap.iri, 
                label: instanceLabels.length === 0 ? undefined : instanceLabels[0]
            });
        }

        return instanceExamples;
    }

}