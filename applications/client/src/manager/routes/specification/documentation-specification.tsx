import React, {useCallback, useContext, useMemo, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {BackendConnectorContext, DefaultConfigurationContext} from "../../../application";
import {ConstructedStoreCacheContext, DataSpecificationsContext} from "../../app";
import {useConstructedStoresFromDescriptors} from "../../utils/use-stores-by-descriptors";
import {getEditorLink} from "../../shared/get-schema-generator-link";
import {GenerateReport} from "../../artifacts/generate-report";
import {DataSpecifications} from "../../data-specifications";
import {isEqual} from "lodash";
import {DefaultArtifactBuilder} from "../../artifacts/default-artifact-builder";
import {saveAs} from "file-saver";
import {useDialog} from "../../../editor/dialog";
import {DeleteDataSchemaForm} from "../../components/delete-data-schema-form";
import {Box, Button, Fab, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {DataSpecificationName, DataSpecificationNameCell} from "../../name-cells";
import {CopyIri} from "./copy-iri";
import {ModifySpecification} from "./modify-specification";
import {SpecificationTags} from "../../components/specification-tags";
import AddIcon from "@mui/icons-material/Add";
import {DataStructureRow} from "./data-structure-row";
import {ReuseDataSpecifications} from "./reuse-data-specifications";
import {GeneratingDialog} from "./generating-dialog";
import {ConfigureArtifacts} from "../../artifacts/configuration/configure-artifacts";
import LoadingButton from "@mui/lab/LoadingButton";
import {RedirectDialog} from "./redirect-dialog";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {CoreResourceReader} from "@dataspecer/core/core/core-reader";
import {StoreDescriptor} from "@dataspecer/backend-utils/store-descriptor";
import {HttpSynchronizedStore} from "@dataspecer/backend-utils/stores";
import {httpFetch} from "@dataspecer/core/io/fetch/fetch-browser";
import {ReadOnlyFederatedStore} from "@dataspecer/core/core/store/federated-store/read-only-federated-store";
import {ConceptualModelSources} from "./conceptual-model-sources";

export const DocumentationSpecification: React.FC<{
    dataSpecificationIri: string;
}> = ({dataSpecificationIri}) => {
    const defaultConfiguration = useContext(DefaultConfigurationContext);

    const {dataSpecifications} = useContext(DataSpecificationsContext);
    const backendConnector = useContext(BackendConnectorContext);

    const specification = dataSpecifications[dataSpecificationIri as string];

    const store = useFederatedObservableStore();
    const stores = useMemo(() => Object.values(specification?.psmStores ?? []).flat(1), [specification?.psmStores]);
    useConstructedStoresFromDescriptors(stores, store);

    const navigate = useNavigate();

    const [redirecting, setRedirecting] = useState(false);
    const createDataStructure = useCallback(async () => {
        if (dataSpecificationIri) {
            setRedirecting(true);
            const {createdPsmSchemaIri} = await backendConnector.createDataStructure(dataSpecificationIri);
            navigate(getEditorLink(dataSpecificationIri, createdPsmSchemaIri));
            setRedirecting(false);
        }
    }, [navigate, backendConnector, dataSpecificationIri]);

    const [zipLoading, setZipLoading] = React.useState<false|"stores-loading"|"generating">(false);
    const [generateDialogOpen, setGenerateDialogOpen] = React.useState<boolean>(false);
    const [generateState, setGenerateState] = React.useState<GenerateReport>([]);
    const constructedStoreCache = useContext(ConstructedStoreCacheContext);
    const generateZip = async () => {
        setZipLoading("stores-loading");
        setGenerateState([]);
        setGenerateDialogOpen(true);

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

        const generator = new DefaultArtifactBuilder(federatedStore, gatheredDataSpecifications, defaultConfiguration);
        await generator.prepare(Object.keys(gatheredDataSpecifications), setGenerateState);
        const data = await generator.build();
        saveAs(data, "artifact.zip");
        setZipLoading(false);
    };

    const DeleteForm = useDialog(DeleteDataSchemaForm, ["dataSpecificationIri"]);

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
                            onDelete={() => DeleteForm.open({dataStructureIri: psm})}
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
        <GeneratingDialog isOpen={generateDialogOpen} close={() => setGenerateDialogOpen(false)} inProgress={!!zipLoading} generateReport={generateState} />
        <Box sx={{
            height: "5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
        }}>
            {dataSpecificationIri && <ConfigureArtifacts dataSpecificationIri={dataSpecificationIri} />}
            <LoadingButton variant="contained" onClick={generateZip} loading={zipLoading !== false}>Generate .ZIP file</LoadingButton>
        </Box>

        <ConceptualModelSources dataSpecificationIri={dataSpecificationIri} />

        <RedirectDialog isOpen={redirecting} />
        <DeleteForm.Component dataSpecificationIri={dataSpecificationIri as string} />
    </>;
}
