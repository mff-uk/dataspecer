import {IriProvider} from "@dataspecer/core/cim";
import {PimStoreWrapper} from "../v1-adapters/pim-store-wrapper";
import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";
import {RdfsFileAdapter} from "@dataspecer/rdfs-adapter";

class IdentityIriProvider implements IriProvider {
    cimToPim = (cimIri: string) => cimIri;
    pimToCim = (pimIri: string) => pimIri;
}

export async function createRdfsModel(urls: string[], httpFetch: HttpFetch) {
    const cim = new RdfsFileAdapter(urls, httpFetch);
    cim.setIriProvider(new IdentityIriProvider());
    const cimObject = await (cim as any).getCim();
    const resources = cimObject.entities;
    const storeWrapper = new PimStoreWrapper({resources} as any, undefined, undefined, urls);
    storeWrapper.fetchFromPimStore();
    return storeWrapper;
}