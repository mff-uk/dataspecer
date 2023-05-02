import { PrefixIriProvider, CimAdapter } from "@dataspecer/core/cim";
import { CoreResource } from "@dataspecer/core/core";
import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { PimClass } from "@dataspecer/core/pim/model";
import { RdfsFileAdapter } from "@dataspecer/rdfs-adapter";
import { RdfHttpSource } from "@dataspecer/core/io/rdf/http/http-rdf-source";
import { RdfMemorySource } from "@dataspecer/core/io/rdf/rdf-memory-source";
import { RdfNode, RdfObject, RdfMemorySourceWrap } from "@dataspecer/core/core/adapter/rdf";

interface Cim {
    readonly classes: PimClass[];
    readonly entities: Record<string, CoreResource>;
}

interface UntaggedCim {
    readonly classes: string[];
}

export function rdfSourceProperty(source: RdfMemorySource, iri: string, properties: string[]): RdfObject[] {
    const result = [] as RdfObject[];
    for (const property of properties) {
        const objects = source.property(iri, property);
        objects.forEach((object) => result.find((o) => o.value === object.value) || result.push(object));
    }
    return result;
}

export function rdfSourceReverseProperty(source: RdfMemorySource, iris: string[], properties: string[]): RdfNode[] {
    const result = [] as RdfNode[];
    for (const iri of iris) {
        for (const property of properties) {
            const objects = source.reverseProperty(property, iri);
            objects.forEach((object) => result.find((o) => o.value === object.value) || result.push(object));
        }
    }
    return result;
}

export class ExtendedRdfsFileAdapter extends RdfsFileAdapter {
    protected untaggedCim: Promise<UntaggedCim> | null = null;

    constructor(urls: string[], httpFetch: HttpFetch) {
        super(urls, httpFetch);
    }

    async getAllClasses(): Promise<PimClass[]> {
        return this.getCim().then((cim: Cim) => cim.classes);
    }

    async getCim(): Promise<Cim> {
        return super.getCim();
    }

    async getUntaggedCim(): Promise<UntaggedCim> {
        const source = new RdfHttpSource();

        let entities = {};

        return { classes: [] };
    }
}

const iriProvider = new PrefixIriProvider();
export const cimAdapter = new ExtendedRdfsFileAdapter(
    ["https://mff-uk.github.io/demo-vocabularies/original/adms.ttl"],
    httpFetch
);
cimAdapter.setIriProvider(iriProvider);
