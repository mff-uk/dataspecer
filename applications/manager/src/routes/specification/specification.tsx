import React, {useCallback, useContext, useMemo, useState} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {Box, Button, Fab, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {ReuseDataSpecifications} from "./reuse-data-specifications";
import AddIcon from "@mui/icons-material/Add";
import {saveAs} from "file-saver";
import LoadingButton from '@mui/lab/LoadingButton';
import {BackendConnectorContext, ConstructedStoreCacheContext, DataSpecificationsContext} from "../../app";
import {useConstructedStoresFromDescriptors} from "../../utils/use-stores-by-descriptors";
import {DataStructureRow} from "./data-structure-row";
import {DataSpecificationName, DataSpecificationNameCell} from "../../name-cells";
import {getSchemaGeneratorLink} from "../../shared/get-schema-generator-link";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {DataSpecifications} from "../../data-specifications";
import {StoreDescriptor} from "@dataspecer/backend-utils/store-descriptor";
import {CoreResourceReader, ReadOnlyFederatedStore} from "@dataspecer/core/core";
import {isEqual} from "lodash";
import {HttpSynchronizedStore} from "@dataspecer/backend-utils/stores/http-synchronized-store";
import {DefaultArtifactBuilder} from "../../artifacts/default-artifact-builder";
import {RedirectDialog} from "./redirect-dialog";
import {ModifySpecification} from "./modify-specification";
import {SpecificationTags} from "../../components/specification-tags";
import {httpFetch} from "@dataspecer/core/io/fetch/fetch-browser";
import {CopyIri} from "./copy-iri";

export const Specification: React.FC = () => {
    const [searchParams] = useSearchParams();
    const dataSpecificationIri = searchParams.get("dataSpecificationIri");

    const {dataSpecifications} = useContext(DataSpecificationsContext);
    const backendConnector = useContext(BackendConnectorContext);

    const specification = dataSpecifications[dataSpecificationIri as string];

    const store = useFederatedObservableStore();
    const stores = useMemo(() => Object.values(specification?.psmStores ?? []).flat(1), [specification?.psmStores]);
    useConstructedStoresFromDescriptors(stores, store);

    const [redirecting, setRedirecting] = useState(false);
    const createDataStructure = useCallback(async () => {
        if (dataSpecificationIri) {
            setRedirecting(true);
            const {createdPsmSchemaIri} = await backendConnector.createDataStructure(dataSpecificationIri);
            // Skip this to avoid confusing users
            /*setDataSpecifications({
                ...dataSpecifications,
                [dataSpecification.iri as string]: dataSpecification
            });*/
            window.location.href = getSchemaGeneratorLink(dataSpecificationIri, createdPsmSchemaIri);
        }
    }, [backendConnector, dataSpecificationIri]);

    const [zipLoading, setZipLoading] = React.useState<false|"stores-loading"|"generating">(false);
    const constructedStoreCache = useContext(ConstructedStoreCacheContext);
    const generateZip = async () => {
        setZipLoading("stores-loading");

        // Gather all data specifications

        // We know, that the current data specification must be present
        const gatheredDataSpecifications: DataSpecifications = {};

        const toProcessDataSpecification = [dataSpecificationIri as string];
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

        const generator = new DefaultArtifactBuilder(federatedStore, gatheredDataSpecifications);
        const data = await generator.build(Object.keys(gatheredDataSpecifications));
        saveAs(data, "artifact.zip");
        setZipLoading(false);
    };

    if (!dataSpecificationIri) {
        return null;
    }

    return <>
        <Box height="30px"/>
        <Box>
            <Typography variant="h6" component="div">Data specification:</Typography>
        </Box>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
            <DataSpecificationName iri={dataSpecificationIri}>
                {(label, isLoading) => <Typography variant="h3" component="div" gutterBottom>
                    {isLoading ? <Skeleton /> : (label ? label : <small>{dataSpecificationIri}</small>)}
                </Typography>}
            </DataSpecificationName>
            <div style={{display: "flex", gap: "1rem"}}>
                <CopyIri iri={dataSpecificationIri} />
                <ModifySpecification iri={dataSpecificationIri} />
            </div>
        </Box>
        <SpecificationTags iri={dataSpecificationIri} />

        <Box display="flex" flexDirection="row" justifyContent="space-between" sx={{mt: 5}}>
            <Typography variant="h5" component="div" gutterBottom>Data structures </Typography>
            {dataSpecificationIri && <Fab variant="extended" size="medium" color={"primary"} onClick={createDataStructure}>
                <AddIcon sx={{mr: 1}}/>
                Create new
            </Fab>}
        </Box>
        <TableContainer component={Paper} sx={{mt: 3}}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{width: "25%"}}>Name</TableCell>
                        <TableCell>Resources</TableCell>
                        {/*<TableCell align="center">JSON</TableCell>*/}
                        {/*<TableCell align="center">XML</TableCell>*/}
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {specification?.psms.map(psm =>
                        <DataStructureRow
                            key={psm}
                            dataStructureIri={psm}
                            specificationIri={dataSpecificationIri as string}
                        />
                    )}
                </TableBody>
            </Table>
        </TableContainer>

        <Box display="flex" flexDirection="row" justifyContent="space-between" sx={{mt: 5}}>
            <Typography variant="h5" component="div" gutterBottom>Reused data specifications</Typography>
            {dataSpecificationIri && <ReuseDataSpecifications dataSpecificationIri={dataSpecificationIri}/>}
        </Box>
        <TableContainer component={Paper} sx={{mt: 3}}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{width: "100%"}}>Name</TableCell>
                        <TableCell/>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {specification?.importsDataSpecifications.map(specification =>
                        <TableRow key={specification}>
                            <TableCell component="th" scope="row" sx={{width: "25%"}}>
                                <DataSpecificationNameCell dataSpecificationIri={specification as string} />
                            </TableCell>
                            <TableCell align="right">
                                <Box sx={{
                                    display: "flex",
                                    gap: "1rem",
                                }}>
                                    <Button variant="outlined" color={"primary"} component={Link}
                                            to={`/specification?dataSpecificationIri=${encodeURIComponent(specification)}`}>Detail</Button>
                                </Box>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>


        <Typography variant="h5" component="div" gutterBottom sx={{mt: 5}}>
            Generate artifacts
        </Typography>
        <Box sx={{
            height: "5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <LoadingButton variant="contained" onClick={generateZip} loading={zipLoading !== false}>Generate .ZIP file</LoadingButton>
        </Box>

        <RedirectDialog isOpen={redirecting} />
    </>;
}
