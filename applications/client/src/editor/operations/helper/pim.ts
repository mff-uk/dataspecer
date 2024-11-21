import { SemanticModelClass } from '@dataspecer/core-v2/semantic-model/concepts';
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";
import { createClass } from '@dataspecer/core-v2/semantic-model/operations';

export async function createPimClassIfMissing(
    resource: SemanticModelClass,
    pimSchema: string,
    store: FederatedObservableStore,
): Promise<string> {
    const existingPimIri = await store.getPimHavingInterpretation(resource.id as string, "", pimSchema);

    if (existingPimIri) {
        // todo it does not perform any checks
        return existingPimIri;
    }

    // const pimCreateClass = new PimCreateClass();
    // copyPimPropertiesFromResourceToOperation(resource, pimCreateClass);
    // pimCreateClass.pimIsCodelist = false;
    // const pimCreateClassResult = await store.applyOperation(pimSchema, pimCreateClass);
    // return pimCreateClassResult.created[0] as string;

    const op = createClass({
        iri: resource.iri,
        name: resource.name,
        description: resource.description,
    });
    // @ts-ignore
    const {id} = await store.applyOperation(pimSchema, op);
    return id as string;
}
