import { HttpStoreDescriptor, StoreDescriptor } from "@dataspecer/backend-utils/store-descriptor";
import { HttpSynchronizedStore } from "@dataspecer/backend-utils/stores";
import { EntityModelAsCoreResourceReader } from "@dataspecer/core-v2";
import { CoreResourceReader, ReadOnlyFederatedStore } from "@dataspecer/core/core";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import LoadingButton from "@mui/lab/LoadingButton";
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { saveAs } from "file-saver";
import { clone, isEqual } from "lodash";
import React, { FC, useContext, useEffect, useState } from "react";
import { BackendConnectorContext, DefaultConfigurationContext } from "../../application";
import { DataSpecification, HttpSemanticModelStoreDescriptor } from "../../specification";
import { ConstructedStoreCacheContext, DataSpecificationsContext } from "../app";
import { ConfigureArtifactsConfiguration } from "./configuration/configure-artifacts-configuration";
import { DefaultArtifactBuilder } from "./default-artifact-builder";
import { GenerateReport } from "./generate-report";

/**
 * Dialog that orchestrates the whole process of generation of the artifacts.
 *
 * It is possible to alter the configuration and see the generation progress.
 */
export const GenerateDialog: FC<{
    isOpen: boolean,
    close: () => void,
    dataSpecifications: string[],
}> = (props) => {
    const backendConnector = useContext(BackendConnectorContext);

    const {dataSpecifications} = useContext(DataSpecificationsContext);
    const constructedStoreCache = useContext(ConstructedStoreCacheContext);
    const defaultConfiguration = useContext(DefaultConfigurationContext);

    const [localConfiguration, setLocalConfiguration] = useState(() => clone(defaultConfiguration));
    useEffect(() => {
        if (props.isOpen) {
            setLocalConfiguration(clone(defaultConfiguration))
        }
    }, [props.isOpen, defaultConfiguration]);

    const [zipLoading, setZipLoading] = React.useState<false|"stores-loading"|"generating">(false);
    const [generateState, setGenerateState] = React.useState<GenerateReport>([]);
    const successCount = generateState.filter(s => s.state === "success").length;
    const errorCount = generateState.filter(s => s.state === "error").length;
    const generateZip = async () => {
        setZipLoading("stores-loading");
        setGenerateState([]);

        // Gather all data specifications

        // We know, that the current data specification must be present
        const gatheredDataSpecifications: Record<string, DataSpecification> = {};

        const toProcessDataSpecification = [...props.dataSpecifications];
        for (let i = 0; i < toProcessDataSpecification.length; i++) {
            const dataSpecification = dataSpecifications[toProcessDataSpecification[i]];
            gatheredDataSpecifications[dataSpecification.id as string] = dataSpecification;
            dataSpecification.importsDataSpecificationIds.forEach(importedDataSpecificationId => {
                if (!toProcessDataSpecification.includes(importedDataSpecificationId)) {
                    toProcessDataSpecification.push(importedDataSpecificationId);
                }
            });
            // @ts-ignore
            dataSpecification.artefactConfiguration = await backendConnector.getArtifactConfiguration(dataSpecification.artifactConfigurations[0].id);
        }

        // Gather all store descriptors

        const storeDescriptors: StoreDescriptor[] = [];
        for (const dataSpecification of Object.values(gatheredDataSpecifications)) {
            const stores = backendConnector.getStoreDescriptorsForDataSpecification(dataSpecification);
            storeDescriptors.push(...stores.pimStores);
            storeDescriptors.push(...Object.values(stores.psmStores).flat(1));
        }

        // Create stores or use the cache.

        const constructedStores: CoreResourceReader[] = [];

        for (const storeDescriptor of storeDescriptors) {
            // Direct match
            if (constructedStoreCache.has(storeDescriptor)) {
                constructedStores.push(constructedStoreCache.get(storeDescriptor) as CoreResourceReader);
                continue;
            }

            // Match by object comparison
            const storeFromCache = [...constructedStoreCache.entries()]
                .find(([cachedDescriptor]) => isEqual(cachedDescriptor, storeDescriptor))
                ?.[1];

            if (storeFromCache) {
                constructedStores.push(storeFromCache);
                continue;
            }


            // Build store
            if (HttpStoreDescriptor.is(storeDescriptor)) {
                const store = HttpSynchronizedStore.createFromDescriptor(storeDescriptor, httpFetch);
                await store.load();
                constructedStores.push(store);
            } else if (HttpSemanticModelStoreDescriptor.is(storeDescriptor)) { // It is PIM store
                const [store] = await backendConnector.constructSemanticModelFromIds([storeDescriptor.modelId!])!;
                constructedStores.push(new EntityModelAsCoreResourceReader(store));
            }
        }

        const federatedStore = ReadOnlyFederatedStore.createLazy(constructedStores);

        setZipLoading("generating");

        const generator = new DefaultArtifactBuilder(federatedStore, gatheredDataSpecifications, defaultConfiguration);
        await generator.prepare(Object.keys(gatheredDataSpecifications), setGenerateState);
        const data = await generator.build();
        saveAs(data, "artifacts.zip");
        setZipLoading(false);
    };


    return <Dialog
        open={props.isOpen}
        onClose={props.close}
        maxWidth="md"
        fullWidth
    >
        <DialogTitle>
            Generate artifacts for {props.dataSpecifications.length === 1 ? "1 specification" : props.dataSpecifications.length + " specifications"}
        </DialogTitle>

        <DialogContent>
            <Alert severity="info" sx={{mb: 3}}>Individual data specifications may overwrite these configurations if explicitly set. By default, nothing is overwritten.</Alert>
            <div style={{opacity: !!zipLoading ? .25 : 1, pointerEvents: !!zipLoading ? "none" : undefined}}>
                <ConfigureArtifactsConfiguration defaultConfiguration={undefined} configuration={localConfiguration} onConfigurationChange={setLocalConfiguration} />
            </div>
        </DialogContent>

        <DialogActions>
            {!!zipLoading &&
                <Box sx={{flexGrow: 1, ml: 2, display: "flex", alignItems: "center", gap: 2}}>
                    <CircularProgress size={20} />
                    <Typography>
                        {zipLoading === "stores-loading" ? "Loading stores" : <>Generating artifacts {successCount + errorCount}/{generateState.length}</>}
                    </Typography>
                </Box>
            }
            <Button onClick={props.close}>Cancel</Button>
            <LoadingButton onClick={generateZip}>Generate to .ZIP</LoadingButton>
        </DialogActions>
    </Dialog>;
}
