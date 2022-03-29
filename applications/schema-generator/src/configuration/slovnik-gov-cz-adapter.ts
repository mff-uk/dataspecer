import {PrefixIriProvider} from "@model-driven-data/core/cim";
import {SgovAdapter} from "@model-driven-data/core/sgov";
import {httpFetch} from "@model-driven-data/core/io/fetch/fetch-browser";

export const getSlovnikGovCzAdapter = () => {
    const iriProvider = new PrefixIriProvider();
    const cimAdapter = new SgovAdapter("https://slovník.gov.cz/sparql", httpFetch);
    cimAdapter.setIriProvider(iriProvider);
    return {iriProvider, cimAdapter};
}
