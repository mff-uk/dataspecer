import { HttpStoreDescriptor, StoreDescriptor } from "@dataspecer/backend-utils/store-descriptor";
import { HttpSynchronizedStore } from "@dataspecer/backend-utils/stores";
import { CoreResourceReader } from "@dataspecer/core/core/core-reader";
import { ReadOnlyFederatedStore } from "@dataspecer/core/core/store/federated-store/read-only-federated-store";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import AddIcon from "@mui/icons-material/Add";
import LoadingButton from "@mui/lab/LoadingButton";
import {
    Box,
    Button,
    Grid,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import { saveAs } from "file-saver";
import { isEqual } from "lodash";
import React, { memo, useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { BackendConnectorContext, DefaultConfigurationContext } from "../../../application";
import { useDialog } from "../../../editor/dialog";
import { DataSpecification, HttpSemanticModelStoreDescriptor } from "@dataspecer/backend-utils/connectors/specification";
import { ConstructedStoreCacheContext, DataSpecificationsContext } from "../../app";
import { ConfigureArtifacts } from "../../artifacts/configuration/configure-artifacts";
import { ConfigureButton } from "../../artifacts/configuration/configure-button";
import { DefaultArtifactBuilder } from "../../artifacts/default-artifact-builder";
import { GenerateReport } from "../../artifacts/generate-report";
import { DeleteDataSchemaForm } from "../../components/delete-data-schema-form";
import { SpecificationTags } from "../../components/specification-tags";
import { UpdatePim } from "../../components/update-pim";
import { DataSpecificationName, DataSpecificationNameCell } from "../../name-cells";
import { getEditorLink } from "../../shared/get-schema-generator-link";
import { ConceptualModelSources } from "./conceptual-model-sources";
import { ConceptualModelTargets } from "./conceptual-model-targets";
import { ConsistencyFix } from "./consistency-fix";
import { CopyIri } from "./copy-iri";
import { DataStructureBox } from "./data-structure-row";
import { GarbageCollection } from "./garbage-collection";
import { GeneratingDialog } from "./generating-dialog";
import { ModifySpecification } from "./modify-specification";
import { RedirectDialog } from "./redirect-dialog";
import { ReuseDataSpecifications } from "./reuse-data-specifications";
import { EntityModelAsCoreResourceReader } from "@dataspecer/core-v2/entity-model";
import { DataSpecificationConfiguration, DataSpecificationConfigurator } from "@dataspecer/core/data-specification/configuration";

export const DocumentationSpecification = memo(({dataSpecificationIri}: {
    dataSpecificationIri: string;
}) => {
    const {t} = useTranslation("ui");

    const defaultConfiguration = useContext(DefaultConfigurationContext);

    const {dataSpecifications} = useContext(DataSpecificationsContext);
    const backendConnector = useContext(BackendConnectorContext);

    const specification = dataSpecifications[dataSpecificationIri as string];

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
    const generateZip = async (configurationId: string, overrideBasePathsToNull: boolean = false) => {
        setZipLoading("stores-loading");
        setGenerateState([]);
        setGenerateDialogOpen(true);

        // Gather all data specifications

        // We know, that the current data specification must be present
        let gatheredDataSpecifications: Record<string, DataSpecification> = {};

        const toProcessDataSpecification = [dataSpecificationIri as string];
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

        // Override base urls to null
        if (overrideBasePathsToNull) {
            gatheredDataSpecifications = structuredClone(gatheredDataSpecifications);
            for (const ds of Object.values(gatheredDataSpecifications)) {
                // @ts-ignore
                if (ds.artefactConfiguration[DataSpecificationConfigurator.KEY]) {
                    // @ts-ignore
                    (ds.artefactConfiguration[DataSpecificationConfigurator.KEY] as DataSpecificationConfiguration).publicBaseUrl = null;
                }
            }
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
        saveAs(data, "artifact.zip");
        setZipLoading(false);
    };

    const DeleteForm = useDialog(DeleteDataSchemaForm, ["dataSpecificationIri"]);

    if (!dataSpecificationIri) {
        return null;
    }

    return <>
        <Box height="30px"/>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
            <DataSpecificationName iri={dataSpecificationIri}>
                {(label, isLoading) => <Typography variant="h3" component="div" gutterBottom>
                    {isLoading ? <Skeleton /> : (label ? label : <small>{dataSpecificationIri}</small>)}
                </Typography>}
            </DataSpecificationName>
            <div style={{display: "flex", gap: "1rem"}}>
                <ConfigureButton dataSpecificationIri={dataSpecificationIri} />
                <CopyIri iri={dataSpecificationIri} />
                <ModifySpecification iri={dataSpecificationIri} />
            </div>
        </Box>
        <SpecificationTags iri={dataSpecificationIri} />

        <Box display="flex" flexDirection="row" justifyContent="space-between" sx={{mt: 10}}>
            <Grid container spacing={3}>
                {specification?.dataStructures.map(psm =>
                    <Grid item xs={4} key={psm.id}>
                        <DataStructureBox
                            dataStructureIri={psm.id}
                            specificationIri={dataSpecificationIri as string}
                            onDelete={() => DeleteForm.open({dataStructureIri: psm.id})}
                        />
                    </Grid>
                )}

                <Grid item xs={4}>
                    <Button variant="outlined" color={"inherit"} sx={{height: "4.75cm", display: "flex", alignItems: "center", justifyContent: "center"}} onClick={createDataStructure} fullWidth>
                        <AddIcon fontSize={"large"} color={"inherit"} />
                        <Typography>{t("create data structure")}</Typography>
                    </Button>
                </Grid>

            </Grid>
        </Box>

        <Box display="flex" flexDirection="row" justifyContent="space-between" sx={{mt: 5}}>
            <Typography variant="h5" component="div" gutterBottom>{t("reused data specifications")}</Typography>
            {dataSpecificationIri && <ReuseDataSpecifications dataSpecificationIri={dataSpecificationIri}/>}
        </Box>
        <TableContainer component={Paper} sx={{mt: 3}}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{width: "100%"}}>{t("name")}</TableCell>
                        <TableCell/>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {specification?.importsDataSpecificationIds.map(specification =>
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
                                            to={`/specification?dataSpecificationIri=${encodeURIComponent(specification)}`}>{t("detail")}</Button>
                                </Box>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>


        <Typography variant="h5" component="div" gutterBottom sx={{mt: 5}}>
            {t("generate artifacts")}
        </Typography>
        <GeneratingDialog isOpen={generateDialogOpen} close={() => setGenerateDialogOpen(false)} inProgress={!!zipLoading} generateReport={generateState} />
        {specification && specification.artifactConfigurations.map(configuration => <Box key={configuration.id}
        sx={{
            height: "5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
        }}>
            {dataSpecificationIri && <ConfigureArtifacts dataSpecificationId={dataSpecificationIri} configurationId={configuration.id} />}
            <LoadingButton variant="contained" onClick={() => generateZip(configuration.id, false)} loading={zipLoading !== false}>{t("generate zip file")}</LoadingButton>
            <LoadingButton onClick={() => generateZip(configuration.id, true)} loading={zipLoading !== false}>{t("generate zip file with relative paths")}</LoadingButton>
            <Button variant="contained" href={import.meta.env.VITE_BACKEND + "/generate?iri=" + encodeURIComponent(dataSpecificationIri)}>Generate sample application</Button>
        </Box>)}

        {/* <ConceptualModelSources dataSpecificationIri={dataSpecificationIri} /> */}

        <ConceptualModelTargets dataSpecificationIri={dataSpecificationIri} />

        <Typography variant="h5" component="div" gutterBottom sx={{mt: 5}}>
            Advanced
        </Typography>

        <GarbageCollection dataSpecificationIri={dataSpecificationIri} />
        <ConsistencyFix dataSpecificationIri={dataSpecificationIri} />
        <UpdatePim dataSpecificationIri={dataSpecificationIri} />

        <RedirectDialog isOpen={redirecting} />
        <DeleteForm.Component dataSpecificationIri={dataSpecificationIri as string} />
    </>;
});
