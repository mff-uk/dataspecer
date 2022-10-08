import {PrefixIriProvider} from "@dataspecer/core/cim";
import {SgovAdapter} from "@dataspecer/sgov-adapter";
import {httpFetch} from "@dataspecer/core/io/fetch/fetch-browser";

export const getSlovnikGovCzAdapter = () => {
    const iriProvider = new PrefixIriProvider();
    const cimAdapter = new SgovAdapter("https://slovník.gov.cz/sparql", httpFetch);
    cimAdapter.setIriProvider(iriProvider);
    return {iriProvider, cimAdapter};
}
