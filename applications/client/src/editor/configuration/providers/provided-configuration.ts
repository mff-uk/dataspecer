import {Configuration} from "../configuration";
import {DataSpecification} from "@dataspecer/core/data-specification/model";
import {DataSpecificationWithMetadata} from "@dataspecer/backend-utils/interfaces";
import {DataSpecificationWithStores} from "@dataspecer/backend-utils/interfaces";
import {StoreDescriptor} from "@dataspecer/backend-utils/store-descriptor";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";
import {CoreResourceReader} from "@dataspecer/core/core";
import {isEqual} from "lodash";
import {HttpSynchronizedStore} from "@dataspecer/backend-utils/stores";
import {useAsyncMemo} from "../../hooks/use-async-memo";
import {useEffect, useMemo, useState} from "react";
import {getAdapter} from "../adapters/get-adapter";
import {BackendConnector} from "@dataspecer/backend-utils/connectors";
import {OperationContext} from "../../operations/context/operation-context";
import {httpFetch} from "@dataspecer/core/io/fetch/fetch-browser";
import { ClientConfigurator, DefaultClientConfiguration } from "../../../configuration";

const DEFAULT_CIM_ADAPTERS_CONFIGURATION = [];

/**
 * Loads the configuration from the given IRIs and registers the stores properly
 * to be updated when modification occurs. This hook requires loaders that
 * decide how to load the configuration from the given IRIs.
 * @param enabled
 * @param dataSpecificationIri IRI of the whole specification
 * @param dataPsmSchemaIri IRI of the given PSM schema that will be updated
 */
export const useProvidedConfiguration = (
    enabled: boolean,
    dataSpecificationIri: string|null,
    dataPsmSchemaIri: string|null,
): Configuration | null => {
    const store = useMemo(() => enabled ? new FederatedObservableStore() : null, [enabled]);

    const specifications = useLoadedDataSpecification(dataSpecificationIri);
    const descriptors = useStoreDescriptorsFromSpecifications(specifications ?? null, dataSpecificationIri, dataPsmSchemaIri);
    useConstructedStoresFromDescriptors(descriptors ?? [], store);

    const specification = specifications?.[dataSpecificationIri ?? ""] ?? null;
    const operationContext = useMemo(() => {
        const configuration = ClientConfigurator.merge(
            DefaultClientConfiguration,
            ClientConfigurator.getFromObject(specification?.artefactConfiguration)
        )

        const context = new OperationContext();
        context.labelRules = {
            languages: [configuration.technicalLabelLanguages],
            namingConvention: configuration.technicalLabelCasingConvention,
            specialCharacters: configuration.technicalLabelSpecialCharacters,
        };
        return context;
    }, [specification]);

    const cimAdaptersConfiguration = specifications?.[dataSpecificationIri]?.cimAdapters ?? DEFAULT_CIM_ADAPTERS_CONFIGURATION;
    const cim = useMemo(() => enabled ? getAdapter(cimAdaptersConfiguration) : null, [enabled, cimAdaptersConfiguration]);

    if (enabled) {
        return {
            store: store as FederatedObservableStore,
            dataSpecifications: specifications ?? {},
            dataSpecificationIri,
            dataPsmSchemaIri,
            cim: cim as ReturnType<typeof getAdapter>,
            operationContext,
        }
    } else {
        return null;
    }
}

// So far only supported connector
const backendConnector = new BackendConnector(process.env.REACT_APP_BACKEND as string, httpFetch);
const connector = backendConnector;

const useLoadedDataSpecification = (dataSpecificationIri: string|null) => {
    return useAsyncMemo(async () => {
        if (!dataSpecificationIri) {
            return null;
        }

        const dataSpecificationIrisToLoad = [dataSpecificationIri];
        const dataSpecifications: { [iri: string]: DataSpecification } = {};

        for (let i = 0; i < dataSpecificationIrisToLoad.length; i++) {
            const dataSpecificationIri = dataSpecificationIrisToLoad[i];
            const dataSpecification = await connector.readDataSpecification(dataSpecificationIri);
            if (dataSpecification) {
                dataSpecifications[dataSpecificationIri] = dataSpecification;
                dataSpecification.importsDataSpecifications.forEach(importIri => {
                    if (!dataSpecificationIrisToLoad.includes(importIri)) {
                        dataSpecificationIrisToLoad.push(importIri);
                    }
                });
            }
        }

        return dataSpecifications;
    }, [dataSpecificationIri])[0];
}

const useStoreDescriptorsFromSpecifications = (
    specifications: { [iri: string]: DataSpecification }|null,
    dataSpecificationIri: string|null,
    dataPsmSchemaIri: string|null,
) =>
    useMemo(() => {
        if (specifications && dataSpecificationIri && dataPsmSchemaIri) {
            const getDS = (iri: string) => specifications[iri] as DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores;

            // Gather all data specifications
            const fullDataSpecificationIris = getDS(dataSpecificationIri).importsDataSpecifications;
            for (let i = 0; i < fullDataSpecificationIris.length; i++) {
                const dsIri = fullDataSpecificationIris[i];
                const dataSpecification = getDS(dsIri);
                if (dataSpecification) {
                    dataSpecification.importsDataSpecifications.forEach(dsIri => {
                        if (!fullDataSpecificationIris.includes(dsIri)) {
                            fullDataSpecificationIris.push(dsIri);
                        }
                    });
                }
            }

            // Gather all stores
            const stores: StoreDescriptor[] = [];
            fullDataSpecificationIris.forEach(dsIri => {
                const dataSpecification = getDS(dsIri);
                stores.push(...dataSpecification.pimStores);
                Object.values(dataSpecification.psmStores).forEach(psm => {
                    stores.push(...psm);
                });
            });
            if (!fullDataSpecificationIris.includes(dataSpecificationIri)) {
                const dataSpecification = getDS(dataSpecificationIri);
                stores.push(...dataSpecification.pimStores);
                stores.push(...dataSpecification.psmStores[dataPsmSchemaIri]);
            }

            return stores;
        }

        return null;
    }, [specifications, dataSpecificationIri, dataPsmSchemaIri]);

export const useConstructedStoresFromDescriptors = (
    descriptors: StoreDescriptor[],
    federatedObservableStore: FederatedObservableStore|null,
) => {
    // Stores that are already created and handled by this hook.
    const [constructedStoreCache] = useState(new Map<StoreDescriptor, CoreResourceReader>());

    useEffect(() => {
        if (federatedObservableStore) {
            const listener = () => {
                for (const [,store] of constructedStoreCache) {
                    (store as HttpSynchronizedStore).save().then();
                }
            }
            federatedObservableStore.addEventListener("afterOperationExecuted", listener);
            return () => federatedObservableStore.removeEventListener("afterOperationExecuted", listener);
        }
    }, [constructedStoreCache, federatedObservableStore]);

    useEffect(() => {
        if (federatedObservableStore) {
            for (const descriptor of descriptors) {
                if (!constructedStoreCache.has(descriptor)) {
                    let found = false;
                    for (const [cachedDescriptor, value] of constructedStoreCache) {
                        if (isEqual(cachedDescriptor, descriptor)) {
                            constructedStoreCache.set(descriptor, value);
                            constructedStoreCache.delete(cachedDescriptor);
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        const store = HttpSynchronizedStore.createFromDescriptor(descriptor, httpFetch);
                        constructedStoreCache.set(descriptor, store);
                        store.load().then(() => {
                            if ([...constructedStoreCache.values()].includes(store)) {
                                federatedObservableStore.addStore(store);
                            }
                        })
                    }
                }
            }

            // Remove old stores
            for (const [descriptor, store] of constructedStoreCache) {
                if (!descriptors.includes(descriptor)) {
                    constructedStoreCache.delete(descriptor);
                    if (federatedObservableStore.getStores().includes(store)) {
                        federatedObservableStore.removeStore(store);
                    }
                }
            }
        }
    }, [descriptors, constructedStoreCache, federatedObservableStore]);

    const [descriptorsWrapped] = useState({descriptors});
    descriptorsWrapped.descriptors = descriptors;

    useEffect(() => {
        if (federatedObservableStore) {
            return () => {
                descriptorsWrapped.descriptors.forEach(descriptor => {
                    const store = constructedStoreCache.get(descriptor);
                    constructedStoreCache.delete(descriptor);
                    if (store && federatedObservableStore.getStores().includes(store)) {
                        federatedObservableStore.removeStore(store);
                    }
                });
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [federatedObservableStore]);
};
