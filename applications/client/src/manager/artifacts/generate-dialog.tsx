import React, {FC, useContext} from "react";
import {Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from "@mui/material";
import {DataSpecifications} from "../data-specifications";
import {StoreDescriptor} from "@dataspecer/backend-utils/store-descriptor";
import {CoreResourceReader, ReadOnlyFederatedStore} from "@dataspecer/core/core";
import {isEqual} from "lodash";
import {HttpSynchronizedStore} from "@dataspecer/backend-utils/stores";
import {httpFetch} from "@dataspecer/core/io/fetch/fetch-browser";
import {DefaultArtifactBuilder} from "./default-artifact-builder";
import {saveAs} from "file-saver";
import {ConstructedStoreCacheContext, DataSpecificationsContext} from "../app";
import {GenerateReport} from "./generate-report";
import LoadingButton from "@mui/lab/LoadingButton";
import {DefaultConfigurationContext} from "../../application";

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

    const {dataSpecifications} = useContext(DataSpecificationsContext);
    const constructedStoreCache = useContext(ConstructedStoreCacheContext);
    const defaultConfiguration = useContext(DefaultConfigurationContext);

    const [zipLoading, setZipLoading] = React.useState<false|"stores-loading"|"generating">(false);
    const [generateState, setGenerateState] = React.useState<GenerateReport>([]);
    const successCount = generateState.filter(s => s.state === "success").length;
    const errorCount = generateState.filter(s => s.state === "error").length;
    const generateZip = async () => {
        setZipLoading("stores-loading");
        setGenerateState([]);

        // Gather all data specifications

        // We know, that the current data specification must be present
        const gatheredDataSpecifications: DataSpecifications = {};

        const toProcessDataSpecification = [...props.dataSpecifications];
        for (let i = 0; i < toProcessDataSpecification.length; i++) {
            const dataSpecification = dataSpecifications[toProcessDataSpecification[i]];
            gatheredDataSpecifications[dataSpecification.iri as string] = dataSpecification;
            dataSpecification.importsDataSpecifications.forEach(importedDataSpecificationIri => {
                if (!toProcessDataSpecification.includes(importedDataSpecificationIri)) {
                    toProcessDataSpecification.push(importedDataSpecificationIri);
                }
            });
        }

        // Gather all store descriptors

        const storeDescriptors = Object.values(gatheredDataSpecifications).reduce((acc, dataSpecification) => {
            return [...acc, ...dataSpecification.pimStores, ...Object.values(dataSpecification.psmStores).flat(1)];
        }, [] as StoreDescriptor[]);

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
            const store = HttpSynchronizedStore.createFromDescriptor(storeDescriptor, httpFetch);
            await store.load();
            constructedStores.push(store);
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
            {/* todo configuration */}
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
