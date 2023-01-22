import {PrefixIriProvider} from "@dataspecer/core/cim";
import {httpFetch} from "@dataspecer/core/io/fetch/fetch-browser";
import {RdfsFileAdapter} from "@dataspecer/rdfs-adapter";
import {SgovAdapter} from "@dataspecer/sgov-adapter";

// todo: this is a temporary solution
export const getAdapter = (urls: string[]) => {
    const iriProvider = new PrefixIriProvider();
    const cimAdapter = urls.length > 0 ?
        new RdfsFileAdapter(urls, httpFetch) :
        new SgovAdapter("https://slovník.gov.cz/sparql", httpFetch);
    cimAdapter.setIriProvider(iriProvider);
    return {iriProvider, cimAdapter};
}
