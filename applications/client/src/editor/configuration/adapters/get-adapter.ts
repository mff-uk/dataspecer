import {PrefixIriProvider} from "@dataspecer/core/cim";
import {httpFetch} from "@dataspecer/core/io/fetch/fetch-browser";
import {RdfsFileAdapter} from "@dataspecer/rdfs-adapter";
import {SgovAdapter} from "@dataspecer/sgov-adapter";
import {WikidataAdapter} from "@dataspecer/wikidata-experimental-adapter";

// todo: this is a temporary solution
export const getAdapter = (urls: string[]) => {
    const iriProvider = new PrefixIriProvider();

    if (urls.length === 0) {
        const cimAdapter = new SgovAdapter("https://slovník.gov.cz/sparql", httpFetch);
        cimAdapter.setIriProvider(iriProvider);
        return {iriProvider, cimAdapter};
    }

    if (urls.length === 1 && urls[0] === "https://dataspecer.com/adapters/wikidata") {
        const cimAdapter = new WikidataAdapter(httpFetch);
        cimAdapter.setIriProvider(iriProvider);
        return {iriProvider, cimAdapter};
    }

    if (urls.length === 1 && urls[0] === "https://dataspecer.com/adapters/sgov-en") {
        const cimAdapter = new SgovAdapter("https://er2023.dataspecer.com/sparql", httpFetch);
        cimAdapter.setIriProvider(iriProvider);
        return {iriProvider, cimAdapter};
    }

    const cimAdapter = new RdfsFileAdapter(urls, httpFetch);
    cimAdapter.setIriProvider(iriProvider);
    return {iriProvider, cimAdapter};
}
