import { HttpStoreDescriptor, StoreDescriptor } from "@dataspecer/backend-utils/store-descriptor";
import { HttpSynchronizedStore } from "@dataspecer/backend-utils/stores";
import { CoreResourceReader } from "@dataspecer/core/core";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { isEqual } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { ClientConfigurator, DefaultClientConfiguration } from "../../../configuration";
import { useAsyncMemo } from "../../hooks/use-async-memo";
import { OperationContext } from "../../operations/context/operation-context";
import { Configuration, useProvidedSourceSemanticModel } from "../configuration";
import { DataSpecification, HttpSemanticModelStoreDescriptor, StructureEditorBackendService } from "../../../specification";
import { EntityModel } from "@dataspecer/core-v2";

const DEFAULT_CIM_ADAPTERS_CONFIGURATION = ["https://dataspecer.com/adapters/sgov"];

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

    const operationContext = useMemo(() => {
        const configuration = ClientConfigurator.merge(
            DefaultClientConfiguration,
            ClientConfigurator.getFromObject({}) // todo specification?.artefactConfiguration
        )

        const context = new OperationContext();
        context.labelRules = {
            languages: [configuration.technicalLabelLanguages],
            namingConvention: configuration.technicalLabelCasingConvention,
            specialCharacters: configuration.technicalLabelSpecialCharacters,
        };
        return context;
    }, []);

    const cimAdaptersConfiguration = specifications?.[dataSpecificationIri]?.sourceSemanticModelIds ?? DEFAULT_CIM_ADAPTERS_CONFIGURATION;
    const sourceSemanticModel = useProvidedSourceSemanticModel(dataPsmSchemaIri, dataSpecificationIri, cimAdaptersConfiguration);

    if (enabled) {
        return {
            store: store as FederatedObservableStore, // ! aggregator
            dataSpecifications: specifications ?? {},
            dataSpecificationIri,
            dataPsmSchemaIri,
            sourceSemanticModel, // ! CIM
            operationContext,
        }
    } else {
        return null;
    }
}

const backendPackageService = new StructureEditorBackendService(process.env.REACT_APP_BACKEND as string, httpFetch, "http://dataspecer.com/packages/local-root");

const useLoadedDataSpecification = (dataSpecificationIri: string|null) => {
    return useAsyncMemo(async () => {
        if (!dataSpecificationIri) {
            return null;
        }

        const dataSpecificationIrisToLoad = [dataSpecificationIri];
        const dataSpecifications: { [iri: string]: DataSpecification } = {};

        for (let i = 0; i < dataSpecificationIrisToLoad.length; i++) {
            const dataSpecificationIri = dataSpecificationIrisToLoad[i];
            // const dataSpecification = await connector.readDataSpecification(dataSpecificationIri);
            const dataSpecification = await backendPackageService.getDataSpecification(dataSpecificationIri);
            if (dataSpecification) {
                dataSpecifications[dataSpecificationIri] = dataSpecification;
                dataSpecification.importsDataSpecificationIds.forEach(importIri => {
                    if (!dataSpecificationIrisToLoad.includes(importIri)) {
                        dataSpecificationIrisToLoad.push(importIri);
                    }
                });
            }
        }

        return dataSpecifications;
    }, [dataSpecificationIri])[0];
}

/**
 * For a given data structure (dataPsmSchemaIri) it returns all store descriptors that are necessary.
 */
const useStoreDescriptorsFromSpecifications = (
    specifications: { [iri: string]: DataSpecification }|null,
    dataSpecificationIri: string|null,
    dataPsmSchemaIri: string|null,
) =>
    useMemo(() => {
        if (specifications && dataSpecificationIri && dataPsmSchemaIri) {
            const getDS = (iri: string) => specifications[iri] as DataSpecification;

            // Gather all data specifications
            const fullDataSpecificationIris = getDS(dataSpecificationIri).importsDataSpecificationIds;
            for (let i = 0; i < fullDataSpecificationIris.length; i++) {
                const dsIri = fullDataSpecificationIris[i];
                const dataSpecification = getDS(dsIri);
                if (dataSpecification) {
                    dataSpecification.importsDataSpecificationIds.forEach(dsIri => {
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
                const descriptors = backendPackageService.getStoreDescriptorsForDataSpecification(dataSpecification);
                stores.push(...descriptors.pimStores);
                Object.values(descriptors.psmStores).forEach(psm => {
                    stores.push(...psm);
                });
            });
            if (!fullDataSpecificationIris.includes(dataSpecificationIri)) {
                const dataSpecification = getDS(dataSpecificationIri);
                const descriptors = backendPackageService.getStoreDescriptorsForDataSpecification(dataSpecification);
                stores.push(...descriptors.pimStores);
                stores.push(...descriptors.psmStores[dataPsmSchemaIri]);
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
                    if (store["save"]) { // todo
                        (store as HttpSynchronizedStore).save().then();
                    } else { // It is semantic model
                        backendPackageService.updateSingleModel(store as unknown as EntityModel).then();
                    }
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
                        if (HttpStoreDescriptor.is(descriptor)) {
                            const store = HttpSynchronizedStore.createFromDescriptor(descriptor, httpFetch);
                            constructedStoreCache.set(descriptor, store);
                            store.load().then(() => {
                                if ([...constructedStoreCache.values()].includes(store)) {
                                    federatedObservableStore.addStore(store);
                                }
                            })
                        } else if (HttpSemanticModelStoreDescriptor.is(descriptor)) { // It is PIM store
                            backendPackageService.constructSemanticModelFromIds([descriptor.modelId!]).then(([model]) => {
                                // @ts-ignore
                                constructedStoreCache.set(descriptor, model);
                                // @ts-ignore
                                federatedObservableStore.addStore(model);
                            });
                        }
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
