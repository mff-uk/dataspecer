import React, {useCallback, useContext, useMemo} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {Box, Button, Fab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {StoreInfo} from "./store-info";
import {ReuseDataSpecifications} from "./reuse-data-specifications";
import AddIcon from "@mui/icons-material/Add";
import {saveAs} from "file-saver";

import LoadingButton from '@mui/lab/LoadingButton';
import {BackendConnectorContext, ConstructedStoreCacheContext, DataSpecificationsContext} from "../../app";
import {useConstructedStoresFromDescriptors} from "../../store/use-stores-by-descriptors";
import {DataStructureRow} from "./data-structure-row";
import {DataSpecificationNameCell} from "../../name-cells";
import {getSchemaGeneratorLink} from "../../shared/get-schema-generator-link";
import {useFederatedObservableStore} from "@model-driven-data/federated-observable-store-react/store";
import {DataSpecifications} from "../../data-specifications";
import {StoreDescriptor} from "@model-driven-data/backend-utils/store-descriptor";
import {CoreResourceReader, ReadOnlyFederatedStore} from "@model-driven-data/core/core";
import {isEqual} from "lodash";
import {HttpSynchronizedStore} from "@model-driven-data/backend-utils/stores/http-synchronized-store";
import {DefaultArtifactBuilder} from "../../artifacts/default-artifact-builder";

export const Specification: React.FC = () => {
    const [searchParams] = useSearchParams();
    const dataSpecificationIri = searchParams.get("dataSpecificationIri");

    const {dataSpecifications, setDataSpecifications} = useContext(DataSpecificationsContext);
    const backendConnector = useContext(BackendConnectorContext);

    const specification = dataSpecifications[dataSpecificationIri as string];

    const store = useFederatedObservableStore();
    const stores = useMemo(() => Object.values(specification?.psmStores ?? []).flat(1), [specification?.psmStores]);
    useConstructedStoresFromDescriptors(stores, store);

    const createDataStructure = useCallback(async () => {
        if (dataSpecificationIri) {
            const {dataSpecification, createdPsmSchemaIri} = await backendConnector.createDataStructure(dataSpecificationIri);
            setDataSpecifications({
                ...dataSpecifications,
                [dataSpecification.iri as string]: dataSpecification
            });
            window.location.href = getSchemaGeneratorLink(dataSpecificationIri, createdPsmSchemaIri);
        }
    }, [backendConnector, dataSpecificationIri, dataSpecifications, setDataSpecifications]);

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
            const store = HttpSynchronizedStore.createFromDescriptor(storeDescriptor);
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

    return <>
        <Box height="30px"/>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
            <Typography variant="h4" component="div" gutterBottom><small style={{fontWeight: "bold"}}>Data specification:</small>{" "}{specification?.iri}</Typography>
        </Box>

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


        <Typography variant="h5" component="div" gutterBottom sx={{mt: 5}}>
            Technical properties
        </Typography>
        <TableContainer component={Paper} sx={{mt: 3}}>
            <Table>
                <TableBody>
                    {/*<StoreInfo storeId={specification?.pimStore ?? null}>*/}
                        <StoreInfo storeId={null}>
                        {(name, operations, resources) =>
                            <>
                                <TableRow>
                                    <TableCell component="th" scope="row" sx={{width: "25%"}}>
                                        <Typography sx={{fontWeight: "bold"}}>PIM store operations</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>
                                            {operations ?? "-"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row" sx={{width: "25%"}}>
                                        <Typography sx={{fontWeight: "bold"}}>PIM store resources</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>
                                            {resources ?? "-"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </>
                        }
                    </StoreInfo>

                </TableBody>
            </Table>
        </TableContainer>

    </>;
}
