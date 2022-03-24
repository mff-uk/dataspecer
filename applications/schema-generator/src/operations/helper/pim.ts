import {PimClass} from "@model-driven-data/core/pim/model";
import {PimCreateClass} from "@model-driven-data/core/pim/operation";
import {copyPimPropertiesFromResourceToOperation} from "./copyPimPropertiesFromResourceToOperation";
import {FederatedObservableStore} from "@model-driven-data/federated-observable-store/federated-observable-store";

export async function createPimClassIfMissing(
    resource: PimClass,
    pimSchema: string,
    store: FederatedObservableStore,
): Promise<string> {
    const existingPimIri = await store.getPimHavingInterpretation(resource.pimInterpretation as string, pimSchema);

    if (existingPimIri) {
        // todo it does not perform any checks
        return existingPimIri;
    }

    const pimCreateClass = new PimCreateClass();
    copyPimPropertiesFromResourceToOperation(resource, pimCreateClass);
    pimCreateClass.pimIsCodelist = resource.pimIsCodelist;
    const pimCreateClassResult = await store.applyOperation(pimSchema, pimCreateClass);
    return pimCreateClassResult.created[0] as string;
}
