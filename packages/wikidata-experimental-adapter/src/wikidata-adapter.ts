import {CimAdapter, IriProvider} from "@dataspecer/core/cim";
import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";
import {OFN, XSD} from "./vocabulary";
import {PimClass} from "@dataspecer/core/pim/model/pim-class";
import {CoreResource, ReadOnlyMemoryStore} from "@dataspecer/core/core";
import {CoreResourceReader} from "@dataspecer/core/core/core-reader";

export class WikidataAdapter implements CimAdapter {
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
    async search(searchQuery: string): Promise<PimClass[]> {
        // @todo use this.httpFetch for querying Wikidata

        const notImplemented = new PimClass();
        notImplemented.iri = "https://www.wikidata.org/";
        notImplemented.pimInterpretation = notImplemented.iri;
        notImplemented.pimHumanLabel = {
            cs: "Not implemented: " + searchQuery,
        };

        return [
            notImplemented,
        ];
    }

    // @todo implement
    async getClass(cimIri: string): Promise<PimClass | null> {
        return null;
    }

    // @todo implement
    async getSurroundings(cimIri: string): Promise<CoreResourceReader> {
        const entities: Record<string, CoreResource> = {};
        return ReadOnlyMemoryStore.create(entities);
    }

    async getFullHierarchy(cimIri: string): Promise<CoreResourceReader> {
        // Keep as is
        return this.getSurroundings(cimIri);
    }

    async getResourceGroup(cimIri: string): Promise<string[]> {
        // Keep as is
        return [];
    }
}
