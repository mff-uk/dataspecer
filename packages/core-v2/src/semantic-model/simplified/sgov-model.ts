import {IriProvider} from "@dataspecer/core/cim";
import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";
import {SgovAdapter} from "@dataspecer/sgov-adapter";
import {CimAdapterWrapper} from "../v1-adapters/cim-adapter-wrapper.ts";
import {ExternalSemanticModel} from "./external-semantic-model.ts";
import {SimpleAsyncQueryableObservableEntityModel} from "../../entity-model/async-queryable/implementation.ts";

class IdentityIriProvider implements IriProvider {
    cimToPim = (cimIri: string) => cimIri;
    pimToCim = (pimIri: string) => pimIri;
}

export function createSgovModel(endpoint: string, httpFetch: HttpFetch, id?: string) {
    const adapter = new SgovAdapter("https://slovník.gov.cz/sparql", httpFetch);
    adapter.setIriProvider(new IdentityIriProvider());
    const queryableWrapper = new CimAdapterWrapper(adapter);
    const observableWrapper = new SimpleAsyncQueryableObservableEntityModel(queryableWrapper);
    return new ExternalSemanticModel(queryableWrapper, observableWrapper, id);
}
