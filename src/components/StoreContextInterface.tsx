import {CimAdapter, IriProvider} from "model-driven-data/cim";
import {FederatedObservableCoreModelReaderWriter} from "../store/federated-observable-store";

export interface StoreContextInterface {
    // The store having all the resources
    // @see ObservableCoreResourceReaderWriter
    store: FederatedObservableCoreModelReaderWriter;
    setStore: (store: FederatedObservableCoreModelReaderWriter) => void;

    // List of IRIs of PSM schemas from the store. The store can be huge and only the following schemas are shown
    psmSchemas: string[];
    setPsmSchemas: (psmSchemas: string[]) => void;

    // Connector to CIM
    cim: {
        iriProvider: IriProvider,
        cimAdapter: CimAdapter,
    };
}
