import {CimAdapter, IriProvider} from "@model-driven-data/core/lib/cim";
import {FederatedObservableStore} from "../store/federated-observable-store";
import {Configuration} from "../configuration/configuration";

export interface StoreContextInterface {
    // The store having all the resources
    // @see ObservableCoreResourceReaderWriter
    store: FederatedObservableStore;
    setStore: (store: FederatedObservableStore) => void;

    // List of IRIs of PSM schemas from the store. The store can be huge and only the following schemas are shown
    psmSchemas: string[];
    setPsmSchemas: (psmSchemas: string[]) => void;

    // Connector to CIM
    cim: {
        iriProvider: IriProvider,
        cimAdapter: CimAdapter,
    };

    configuration?: Configuration,
}
