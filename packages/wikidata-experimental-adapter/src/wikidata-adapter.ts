import {CimAdapter, IriProvider} from "@dataspecer/core/cim";
import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";
import {OFN, XSD} from "./vocabulary";
import {PimClass} from "@dataspecer/core/pim/model/pim-class";
import {CoreResource, ReadOnlyMemoryStore} from "@dataspecer/core/core";
import {CoreResourceReader} from "@dataspecer/core/core/core-reader";
import { WdConnector } from "./connector/wd-connector";
import { ISearchResponse } from "./connector/response";
import { loadWikidataClass } from "./entity-adapters/wd-class-adapter";

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

    // @todo implement
    async search(searchString: string): Promise<PimClass[]> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }
        const results = []
        const searchResponse: ISearchResponse = await this.connector.search(searchString);
        for (const cls of searchResponse.results.classes) {
            const newPimClass = loadWikidataClass(cls, this.iriProvider);
            results.push(newPimClass);
        }
        return results;
    }

    // @todo implement
    async getClass(cimIri: string): Promise<PimClass | null> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }
        return null;
    }

    // @todo implement
    async getSurroundings(cimIri: string): Promise<CoreResourceReader> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }
        
        return ReadOnlyMemoryStore.create({});
    }

    async getFullHierarchy(cimIri: string): Promise<CoreResourceReader> {
        if (!this.iriProvider) {
            throw new Error("Missing IRI provider.");
        }

        return ReadOnlyMemoryStore.create({});
    }

    async getResourceGroup(cimIri: string): Promise<string[]> {
        // Keep as is
        return [];
    }

}
