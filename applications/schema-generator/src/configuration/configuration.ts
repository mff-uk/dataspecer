import {FederatedObservableStore} from "@model-driven-data/federated-observable-store/federated-observable-store";
import {DataSpecification} from "@model-driven-data/core/data-specification/model";
import {CimAdapter, IriProvider} from "@model-driven-data/core/cim";
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
