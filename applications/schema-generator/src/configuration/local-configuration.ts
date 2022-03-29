import {MemoryStore} from "@model-driven-data/core/core";
import {dataPsmExecutors} from "@model-driven-data/core/data-psm/executor";
import {pimExecutors} from "@model-driven-data/core/pim/executor";
import {PimCreateSchema} from "@model-driven-data/core/pim/operation";
import {DataPsmCreateSchema} from "@model-driven-data/core/data-psm/operation";
import {DataSpecification} from "@model-driven-data/core/data-specification/model";
import {FederatedObservableStore} from "@model-driven-data/federated-observable-store/federated-observable-store";
import {useAsyncMemo} from "../hooks/useAsyncMemo";
import {useMemo} from "react";
import {getSlovnikGovCzAdapter} from "./slovnik-gov-cz-adapter";
import {Configuration} from "./configuration";

/**
 * Creates a configuration, that is purely local and does not require any
 * connection to the server. Purpose of this configuration is to be used for
 * testing purposes.
 * @param enabled
 */
export const useLocalConfiguration = (
    enabled: boolean,
): Configuration | null => {
    const store = useMemo(() => enabled ? new FederatedObservableStore() : null, [enabled]);
    const cim = useMemo(() => enabled ? getSlovnikGovCzAdapter() : null, [enabled]);

    const [dataSpecification] = useAsyncMemo(async () => {
        if (enabled && store) {
            const memoryStore = MemoryStore.create("https://ofn.gov.cz", [...dataPsmExecutors, ...pimExecutors]);

            const createPimSchema = new PimCreateSchema();
            const createPimSchemaResult = await memoryStore.applyOperation(createPimSchema);
            const pimSchemaIri = createPimSchemaResult.created[0];

            const createDataPsmSchema = new DataPsmCreateSchema();
            const createDataPsmSchemaResult = await memoryStore.applyOperation(createDataPsmSchema);
            const dataPsmSchemaIri = createDataPsmSchemaResult.created[0];

            const dataSpecification = new DataSpecification();
            dataSpecification.iri = "http://default-data-specification"
            dataSpecification.pim = pimSchemaIri;
            dataSpecification.psms = [dataPsmSchemaIri];

            store.addStore(memoryStore);

            return dataSpecification;
        }
    }, [enabled, store]);

    if (enabled) {
        // @ts-ignore
        return {
            store: store as FederatedObservableStore,
            dataSpecifications: dataSpecification ? { [dataSpecification.iri as string]: dataSpecification } : {},
            dataSpecificationIri: dataSpecification?.iri ?? null,
            dataPsmSchemaIri: dataSpecification?.psms[0] ?? null,
            cim: cim as ReturnType<typeof getSlovnikGovCzAdapter>
        };
    } else {
        return null;
    }
}
