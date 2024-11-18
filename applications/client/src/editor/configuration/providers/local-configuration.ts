import { InMemorySemanticModel } from '@dataspecer/core-v2/semantic-model/in-memory';
import { MemoryStore } from "@dataspecer/core/core";
import { dataPsmExecutors } from "@dataspecer/core/data-psm/data-psm-executors";
import { DataPsmCreateSchema } from "@dataspecer/core/data-psm/operation";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { useMemo } from "react";
import { DefaultClientConfiguration } from "../../../configuration";
import { useAsyncMemo } from "../../hooks/use-async-memo";
import { OperationContext } from "../../operations/context/operation-context";
import { Configuration, useProvidedSourceSemanticModel } from "../configuration";
import { DataSpecification } from '../../../specification';

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
    const sourceSemanticModel = useProvidedSourceSemanticModel(null, null);
    const operationContext = useMemo(() => {
        const context = new OperationContext();
        context.labelRules = {
            languages: [DefaultClientConfiguration.technicalLabelLanguages],
            namingConvention: DefaultClientConfiguration.technicalLabelCasingConvention,
            specialCharacters: DefaultClientConfiguration.technicalLabelSpecialCharacters,
        };
        return context;
    }, []);

    const [dataSpecification] = useAsyncMemo(async () => {
        if (enabled && store) {
            const semanticModel = new InMemorySemanticModel();

            const memoryStore = MemoryStore.create("https://ofn.gov.cz", [...dataPsmExecutors]); // For PSM classes

            const createDataPsmSchema = new DataPsmCreateSchema();
            const createDataPsmSchemaResult = await memoryStore.applyOperation(createDataPsmSchema);
            const dataPsmSchemaIri = createDataPsmSchemaResult.created[0];

            const dataSpecification = {
                id: "http://default-data-specification",
                type: "todo",
                label: {},
                tags: [],
                sourceSemanticModelIds: [],
                localSemanticModelIds: [semanticModel.getId()],
                dataStructures: [{
                    id: dataPsmSchemaIri,
                    label: {},
                }],
                importsDataSpecificationIds: [],
                artifactConfigurations: [],
                userPreferences: {},
            } as DataSpecification;

            // @ts-ignore
            store.addStore(semanticModel);
            store.addStore(memoryStore);

            return dataSpecification;
        }
    }, [enabled, store]);

    if (enabled) {
        return {
            store: store as FederatedObservableStore, // todo: This is like an aggregator
            dataSpecifications: dataSpecification ? { [dataSpecification.iri as string]: dataSpecification } : {},
            dataSpecificationIri: dataSpecification?.iri ?? null,
            dataPsmSchemaIri: dataSpecification?.dataStructures[0].id ?? null,
            sourceSemanticModel, // todo: This is "CIM"
            operationContext,
        };
    } else {
        return null;
    }
}
