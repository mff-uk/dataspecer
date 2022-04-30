import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";
import {DataSpecification} from "@dataspecer/core/data-specification/model";
import {CimAdapter, IriProvider} from "@dataspecer/core/cim";
import {OperationContext} from "../operations/context/operation-context";

export interface Configuration {
    store: FederatedObservableStore,
    dataSpecifications: { [iri: string]: DataSpecification };
    dataSpecificationIri: string|null;
    dataPsmSchemaIri: string|null;
    cim: {
        iriProvider: IriProvider,
        cimAdapter: CimAdapter,
    };
    operationContext: OperationContext,
}
