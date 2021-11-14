import {PimClass} from "model-driven-data/pim/model";
import {OperationExecutor, StoreDescriptor} from "../../store/operation-executor";
import {PimCreateClass} from "model-driven-data/pim/operation";
import {copyPimPropertiesFromResourceToOperation} from "./copyPimPropertiesFromResourceToOperation";

export async function createPimClassIfMissing(
    resource: PimClass,
    pimStoreSelector: StoreDescriptor,
    executor: OperationExecutor,
): Promise<string> {
    const existingPimIri = await executor.store.getPimHavingInterpretation(resource.pimInterpretation as string, pimStoreSelector);

    if (existingPimIri) {
        // todo it does not perform any checks
        return existingPimIri;
    }

    const pimCreateClass = new PimCreateClass();
    copyPimPropertiesFromResourceToOperation(resource, pimCreateClass);
    const pimCreateClassResult = await executor.applyOperation(pimCreateClass, pimStoreSelector);
    return pimCreateClassResult.created[0] as string;
}
