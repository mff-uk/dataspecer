import { CimAdapter, IriProvider } from "@dataspecer/core/cim";
import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { RdfsFileAdapter } from "@dataspecer/rdfs-adapter";
import { SgovAdapter } from "@dataspecer/sgov-adapter";

export type NewCimAdapter = CimAdapter & dsCmeAdapter;

class MyIriProvider implements IriProvider {
    cimToPim(cimId: string) {
        return cimId; // keep shit the same
    }
    pimToCim(pimId: string) {
        return pimId; // keep shit the same
    }
}
export interface dsCmeAdapter {
    getId(): string;
    getLabel(): string;
}

export class InMemoryCimAdapter extends RdfsFileAdapter implements dsCmeAdapter {
    private id;
    constructor(urls: string[], httpFetch: HttpFetch) {
        super(urls, httpFetch);
        this.id = "inMemAdapter" + Date.now();
    }

    getId() {
        return this.id;
    }

    getLabel() {
        return "IMA-";
    }

    static is(elem: any): elem is InMemoryCimAdapter {
        return elem?.id?.startsWith("inMemAdapter") ?? false;
    }
}

export class ExternalCimAdapter extends SgovAdapter implements dsCmeAdapter {
    private id;
    constructor(httpFetch: HttpFetch) {
        super("https://slovník.gov.cz/sparql", httpFetch);
        this.id = "externalAdapter" + Date.now();
    }

    getId() {
        return this.id;
    }

    getLabel() {
        return "EA-";
    }

    static is(elem: any): elem is InMemoryCimAdapter {
        return elem?.id?.startsWith("externalAdapter") ?? false;
    }
}

export class LocalCimAdapter implements dsCmeAdapter {
    getId(): string {
        return "localChanges";
    }
    getLabel(): string {
        return "localChanges";
    }
}

export const getLocalCimAdapter = () => {
    const localAdapter = new LocalCimAdapter();
    return localAdapter;
};

const getAnExternalAdapter = () => {
    const externalAdapter = new ExternalCimAdapter(httpFetch);
    externalAdapter.setIriProvider(new MyIriProvider());
    return externalAdapter;
};

const getAnInMemoryAdapter = () => {
    const adapter = new InMemoryCimAdapter(
        [
            "https://mff-uk.github.io/demo-vocabularies/original/adms.ttl",
            "https://mff-uk.github.io/demo-vocabularies/original/dublin_core_terms.ttl",
        ],
        httpFetch
    );
    adapter.setIriProvider(new MyIriProvider());
    return adapter;
};

export const getSampleAdapters = () => {
    return [getAnExternalAdapter(), getAnInMemoryAdapter()];
};
