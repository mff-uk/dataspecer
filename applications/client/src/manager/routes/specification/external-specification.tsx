import React, {FC, useCallback, useContext, useMemo} from "react";
import {Box, Button, CardContent, Fab, Link, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {DataSpecificationsContext} from "../../app";
import {useConstructedStoresFromDescriptors} from "../../utils/use-stores-by-descriptors";
import {DataSpecificationName} from "../../name-cells";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {ModifySpecification} from "./modify-specification";
import {SpecificationTags} from "../../components/specification-tags";
import {CopyIri} from "./copy-iri";
import {BackendConnectorContext} from "../../../application";
import {useDialog} from "../../../editor/dialog";
import {DeleteDataSchemaForm} from "../../components/delete-data-schema-form";
import {SearchDialog} from "../../../editor/components/cim-search/search-dialog";
import {ConfigurationContext} from "../../../editor/components/App";
import {Configuration} from "../../../editor/configuration/configuration";
import {getSlovnikGovCzAdapter} from "../../../editor/configuration/adapters/slovnik-gov-cz-adapter";
import {PimClass} from "@dataspecer/core/pim/model";
import {DataPsmExternalRoot, DataPsmSchema} from "@dataspecer/core/data-psm/model";
import {CreateExternalRoot} from "../../../editor/operations/create-external-root";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {SlovnikGovCzGlossary} from "../../../editor/components/slovnik.gov.cz/SlovnikGovCzGlossary";
import {LanguageStringUndefineable} from "../../../editor/components/helper/LanguageStringComponents";
import {ExternalArtifactDialog, ExternalArtifactDialogEditableProperties} from "../../components/external-artifact-dialog";
import { DataSpecificationSchema } from "@dataspecer/core/data-specification/model/data-specification-schema";
import { ArtifactType } from "../../../artifact-types";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

/**
 * Single row for one external specification.
 */
const SchemaRow: FC<{
    specificationIri: string,
    dataPsmSchemaIri: string,
    onDelete: () => void,
}> = ({specificationIri, dataPsmSchemaIri, onDelete}) => {
    const {dataSpecifications, setDataSpecifications} = useContext(DataSpecificationsContext);
    const backendConnector = useContext(BackendConnectorContext);
    const specification = dataSpecifications[specificationIri];

    const addNewArtifact = useCallback(async (properties: ExternalArtifactDialogEditableProperties) => {
        let configuration = specification?.artefactConfiguration ?? {};
        const artefact = new DataSpecificationSchema();
        artefact.publicUrl = properties.url;
        artefact.generator = properties.type;
        artefact.iri = properties.url;
        artefact.psm = dataPsmSchemaIri;
        configuration = {
            ...configuration,
            artifacts: [
                // @ts-ignore
                ...(configuration.artifacts ?? []),
                artefact
            ]
        }
        const result = await backendConnector.updateDataSpecification(specificationIri, {artefactConfiguration: configuration});
        setDataSpecifications({...dataSpecifications, [specificationIri]: result});
    }, [specification?.artefactConfiguration, dataPsmSchemaIri, backendConnector, specificationIri, setDataSpecifications, dataSpecifications]);

    /**
     * Immediatelly deletes external artifact
     */
    const deleteArtifact = useCallback(async (artifact: DataSpecificationSchema) => {
        // @ts-ignore
        let configuration: {artifacts: DataSpecificationSchema[]} = specification?.artefactConfiguration ?? {};
        let newConfiguration = {
            ...configuration,
            artifacts: (configuration.artifacts as DataSpecificationSchema[]).filter(a => a !== artifact)
        }
        const result = await backendConnector.updateDataSpecification(specificationIri, {artefactConfiguration: newConfiguration});
        setDataSpecifications({...dataSpecifications, [specificationIri]: result});
    }, [backendConnector, dataSpecifications, setDataSpecifications, specification?.artefactConfiguration, specificationIri]);

    const {resource: psmSchema} = useResource<DataPsmSchema>(dataPsmSchemaIri);
    const {resource: psmRoot} = useResource<DataPsmExternalRoot>(psmSchema?.dataPsmRoots[0]);
    const {resource: pimClass} = useResource<PimClass>(psmRoot?.dataPsmTypes[0]);

    const EditExternalArtifacts = useDialog(ExternalArtifactDialog);

    const beginEditArtifact = useCallback((artifact: DataSpecificationSchema) => {
        EditExternalArtifacts.open({
            mode: "modify",
            properties: {
                type: artifact.generator,
                url: artifact.publicUrl
            },
            onSubmit: async props => {
                const newArtifact = {
                    ...artifact,
                    publicUrl: props.url,
                    generator: props.type,
                    iri: props.url,
                }

                // @ts-ignore
                let configuration: {artifacts: DataSpecificationSchema[]} = specification?.artefactConfiguration ?? {};
                let newConfiguration = {
                    ...configuration,
                    artifacts: (configuration.artifacts as DataSpecificationSchema[]).map(a => a === artifact ? newArtifact : a)
                }
                const result = await backendConnector.updateDataSpecification(specificationIri, {artefactConfiguration: newConfiguration});
                setDataSpecifications({...dataSpecifications, [specificationIri]: result});
            }
        });
    }, [EditExternalArtifacts, backendConnector, dataSpecifications, setDataSpecifications, specification?.artefactConfiguration, specificationIri]);

    const allArtefacts: DataSpecificationSchema[] = (specification?.artefactConfiguration as any)?.artifacts ?? [];
    const artefacts = useMemo(() => allArtefacts.filter(artefact => artefact.psm === dataPsmSchemaIri), [allArtefacts, dataPsmSchemaIri]);

    return <Paper sx={{mt: 3}}>
        <CardContent sx={{display: "flex"}}>
            <Box sx={{flexGrow: 1}}>
                {pimClass && <Typography sx={{mt: 1}}>
                    <LanguageStringUndefineable from={pimClass.pimHumanLabel}>
                        {label =>
                            <LanguageStringUndefineable from={pimClass.pimHumanDescription}>
                                {description => <>
                                    <strong>{label}</strong>
                                    {" "}
                                    <SlovnikGovCzGlossary cimResourceIri={pimClass.pimInterpretation as string}/>
                                    {description && <><br />{description}</>}
                                </>}
                            </LanguageStringUndefineable>
                        }
                    </LanguageStringUndefineable>
                </Typography>}
            </Box>
            <Box>
                <Button
                    variant={"text"}
                    color={"primary"}
                    onClick={() => EditExternalArtifacts.open({mode: "create", onSubmit: addNewArtifact})}
                >
                    Add file
                </Button>
                <Button
                    variant="text"
                    color={"error"}
                    onClick={onDelete}
                >Delete</Button>
            </Box>
        </CardContent>

        <TableContainer sx={{mt: 1}}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{width: "25%"}}>Typ artefaktu</TableCell>
                        <TableCell>URL</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {artefacts.map(artefact =>
                        <TableRow>
                            <TableCell component="th" scope="row" sx={{width: "25%"}}>
                                {ArtifactType[artefact.generator] ?? artefact.generator}
                            </TableCell>
                            <TableCell>
                                <Typography><OpenInNewIcon fontSize="small" sx={{verticalAlign: "middle"}} /> <Link href={artefact.publicUrl} target="_blank">{artefact.publicUrl}</Link></Typography>
                            </TableCell>

                            <TableCell align="right">
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: "1rem",
                                        justifyContent: "flex-end"
                                    }}>
                                    <Button
                                        variant={"text"}
                                        color={"primary"}
                                        onClick={() => beginEditArtifact(artefact)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="text"
                                        color={"error"}
                                        onClick={() => deleteArtifact(artefact)}
                                    >Delete</Button>
                                </Box>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>

        <EditExternalArtifacts.Component />
    </Paper>
}

/**
 * Renders screen window for external specification. This is specification that has already generated artifacts and its
 * schema does not exists.
 */
export const ExternalSpecification: React.FC<{
    dataSpecificationIri: string;
}> = ({dataSpecificationIri}) => {

    const {dataSpecifications, setDataSpecifications} = useContext(DataSpecificationsContext);
    const backendConnector = useContext(BackendConnectorContext);

    const specification = dataSpecifications[dataSpecificationIri as string];

    const store = useFederatedObservableStore();
    const stores = useMemo(() => [
        ...Object.values(specification?.psmStores ?? []).flat(1),
        ...specification?.pimStores
    ], [specification?.psmStores]);
    useConstructedStoresFromDescriptors(stores, store);

    /**
     * Creates a new PSM schema with an external root.
     */
    const createDataStructure = useCallback(async (pimClass: PimClass) => {
        const {createdPsmSchemaIri, dataSpecification} = await backendConnector.createDataStructure(dataSpecificationIri);
        setDataSpecifications({...dataSpecifications, [dataSpecification.iri]: dataSpecification});

        // todo we should wait here

        const op = new CreateExternalRoot(pimClass, specification.pim as string, createdPsmSchemaIri);
        //op.setContext(operationContext);
        await store.executeComplexOperation(op);
    }, [backendConnector, dataSpecificationIri, dataSpecifications, setDataSpecifications, specification.pim, store]);


    const DeleteForm = useDialog(DeleteDataSchemaForm, ["dataSpecificationIri"]);
    const Search = useDialog(SearchDialog);

    const configuration = useMemo(() => ({
        cim: getSlovnikGovCzAdapter()
    } as unknown as Configuration), []);

    if (!dataSpecificationIri) {
        return null;
    }

    return <>
        <ConfigurationContext.Provider value={configuration}>
            <Box height="30px"/>
            <Box>
                <Typography variant="h6" component="div">External specification:</Typography>
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
                {dataSpecificationIri && <Fab variant="extended" size="medium" color={"primary"} onClick={() => Search.open({selected: createDataStructure})}>
                    <AddIcon sx={{mr: 1}}/>
                    Create new
                </Fab>}
            </Box>

            {specification?.psms.map(psm =>
                <SchemaRow
                    key={psm}
                    dataPsmSchemaIri={psm}
                    specificationIri={dataSpecificationIri as string}
                    onDelete={() => DeleteForm.open({dataStructureIri: psm})}
                />
            )}

            <DeleteForm.Component dataSpecificationIri={dataSpecificationIri as string} />
            <Search.Component />
        </ConfigurationContext.Provider>
    </>;
}
