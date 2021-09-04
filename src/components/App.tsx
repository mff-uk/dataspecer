import React, {useCallback, useMemo, useState} from "react";
import {AppBar, Box, Container, Divider, Toolbar, Typography} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import SetRootButton from "./cimSearch/SetRootButton";
import {DataPsmSchemaItem} from "./dataPsm/DataPsmSchemaItem";
import {GenerateArtifacts} from "./generateArtifacts/GenerateArtifacts";
import {SnackbarProvider} from "notistack";
import {LanguageSelector} from "./LanguageSelector";
import {Trans, useTranslation} from "react-i18next";
import {CimAdapter, IriProvider, PrefixIriProvider} from "model-driven-data/cim";
import {SgovAdapter} from "model-driven-data/sgov";
import {httpFetch} from "model-driven-data/io/fetch/fetch-browser";
import {PimMemoryStore} from "model-driven-data/pim/store/memory-store/pim-memory-store";
import {DataPsmMemoryStore} from "model-driven-data/data-psm/store";
import {PimClass} from "model-driven-data/pim/model";
import {executeCompositeCreateSchema} from "../operations/composite-create-schema";
import {ModelObserverContainer} from "../ModelObserverContainer";
import {executeCompositeCreateRootClass} from "../operations/composite-create-root-class";
import {
    CompositeAddClassSurroundings,
    executeCompositeAddClassSurroundings
} from "../operations/composite-add-class-surroundings";
import {CompositeDeleteAttribute, executeCompositeDeleteAttribute} from "../operations/composite-delete-attribute";
import {CompositeUpdateOrder, executeCompositeUpdateOrder} from "../operations/composite-update-order";
import {
    CompositeUpdateDataPsmLabelAndDescription,
    executeCompositeUpdateDataPsmLabelAndDescription
} from "../operations/composite-update-data-psm-label-and-description";
import {
    CompositeUpdatePimLabelAndDescription,
    executeCompositeUpdatePimLabelAndDescription
} from "../operations/composite-update-pim-label-and-description";
import {
    CompositeUpdateResourceTechnicalLabel,
    executeCompositeUpdateResourceTechnicalLabel
} from "../operations/composite-update-resource-technical-label";
import {
    CompositeDeleteAssociationClass,
    executeCompositeDeleteAssociationClass
} from "../operations/composite-delete-association-class";
import {
    CompositeUpdateDataPsmAttributeDatatype,
    executeCompositeUpdateDataPsmAttributeDatatype
} from "../operations/composite-update-data-psm-attribute-datatype";

interface StoreContextInterface {
    addSurroundings: (operation: CompositeAddClassSurroundings) => void,
    setRootClass: (rootPimClass: PimClass) => void,
    deleteAttribute: (operation: CompositeDeleteAttribute) => void,
    updateOrder: (operation: CompositeUpdateOrder) => void,
    cim: {
        iriProvider: IriProvider,
        cimAdapter: CimAdapter,
    },
    models: {
        pim: ModelObserverContainer,
        dataPsm: ModelObserverContainer,
    },
    updateDataPsmLabelAndDescription: (operation: CompositeUpdateDataPsmLabelAndDescription) => void,
    updatePimLabelAndDescription: (operation: CompositeUpdatePimLabelAndDescription) => void,
    updateResourceTechnicalLabel: (operation: CompositeUpdateResourceTechnicalLabel) => void,
    deleteAssociationClass: (operation: CompositeDeleteAssociationClass) => void,
    updateDataPsmAttributeDatatype: (operation: CompositeUpdateDataPsmAttributeDatatype) => void,
    psmSchemas: string[];
    setModels: (models: {pim: ModelObserverContainer, dataPsm: ModelObserverContainer}) => void;
    setPsmSchemas: (schemas: string[]) => void;
}

function createNewModels() {
    return {
        pim: new ModelObserverContainer(new PimMemoryStore()),
        dataPsm: new ModelObserverContainer(new DataPsmMemoryStore()),
    };
}

// @ts-ignore
export const StoreContext = React.createContext<StoreContextInterface>(null);

// const createCIMEntity = (iri: string, store: Store): Store => ({...store, [iri]: CimEntity.as(new CimEntity(iri))});

const App: React.FC = () => {
    const { t } = useTranslation('ui');

    /**
     * For the given type of CIM (type + URL) the application stores
     *  - Instance of the adapter to the CIM
     *
     * For the given workspace the application stores
     *  - PIM model
     *  - data-PSM model and list of schemas todo: a single schema?
     */

      // CIM adapter and ID provider for CIM adapter

    const [cim, setCim] = useState<{ cimAdapter: CimAdapter, iriProvider: IriProvider }>(() => {
        const iriProvider = new PrefixIriProvider();
        const cimAdapter = new SgovAdapter("https://slovník.gov.cz/sparql", httpFetch);
        cimAdapter.setIriProvider(iriProvider);
        return {iriProvider, cimAdapter};
    });

    const [models, setModels] = useState(createNewModels);
    const [psmSchemas, setPsmSchemas] = useState<string[]>([]);

    // Define operations

    const setRootClass = useCallback(async (rootPimClass: PimClass) => {
        setPsmSchemas([]);
        const models = createNewModels();
        setModels(models);
        const schemaIri = await executeCompositeCreateSchema(models, {pimBaseIri: "//pim/", dataPsmBaseIri: "//dataPsm/"});
        await executeCompositeCreateRootClass(models, {pimClass: rootPimClass});
        setPsmSchemas([schemaIri]);
    }, [models]);
    const addSurroundings = useCallback(async (operation: CompositeAddClassSurroundings) => await executeCompositeAddClassSurroundings(models, operation),[models]);
    const deleteAttribute = useCallback((operation: CompositeDeleteAttribute) => executeCompositeDeleteAttribute(models, operation), [models]);
    const updateOrder = useCallback((operation: CompositeUpdateOrder) => executeCompositeUpdateOrder(models, operation), [models]);
    const updateDataPsmLabelAndDescription = useCallback((operation: CompositeUpdateDataPsmLabelAndDescription) => executeCompositeUpdateDataPsmLabelAndDescription(models, operation), [models]);
    const updatePimLabelAndDescription = useCallback((operation: CompositeUpdatePimLabelAndDescription) => executeCompositeUpdatePimLabelAndDescription(models, operation), [models]);
    const updateResourceTechnicalLabel = useCallback((operation: CompositeUpdateResourceTechnicalLabel) => executeCompositeUpdateResourceTechnicalLabel(models, operation), [models]);
    const deleteAssociationClass = useCallback((operation: CompositeDeleteAssociationClass) => executeCompositeDeleteAssociationClass(models, operation), [models]);
    const updateDataPsmAttributeDatatype = useCallback((operation: CompositeUpdateDataPsmAttributeDatatype) => executeCompositeUpdateDataPsmAttributeDatatype(models, operation), [models]);

    const storeContextData: StoreContextInterface = useMemo(() => ({
        deleteAttribute,
        addSurroundings,
        setRootClass,
        cim,
        models,
        updateOrder,
        updateDataPsmLabelAndDescription,
        updatePimLabelAndDescription,
        updateResourceTechnicalLabel,
        deleteAssociationClass,
        psmSchemas,
        updateDataPsmAttributeDatatype,
        setModels,
        setPsmSchemas,
    }), [
        deleteAttribute,
        addSurroundings,
        setRootClass,
        cim,
        models,
        updateOrder,
        updateDataPsmLabelAndDescription,
        updatePimLabelAndDescription,
        updateResourceTechnicalLabel,
        deleteAssociationClass,
        psmSchemas,
        updateDataPsmAttributeDatatype,
        setModels,
        setPsmSchemas,
    ]);


    return <>
        <SnackbarProvider maxSnack={5}>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">
                        {t("title")}
                    </Typography>
                    <Box display="flex" flexGrow="1" justifyContent="flex-end">
                        <LanguageSelector />
                    </Box>
                </Toolbar>
            </AppBar>
            <StoreContext.Provider value={storeContextData}>
                <Container>
                    <Box height="30px"/>
                    <Box display="flex" flexDirection="row" justifyContent="space-between">
                        <Typography variant="h4" paragraph>slovník.gov.cz</Typography>

                        {/*
                        <div>
                            <ButtonGroup>
                                <Fab disabled={sh.length + shi <= 1} size="small" color="secondary" onClick={back}><UndoIcon /></Fab>
                                <Fab disabled={shi >= 0} size="small" color="secondary" onClick={forward}><RedoIcon /></Fab>
                            </ButtonGroup>
                        </div>
                        */}
                        <GenerateArtifacts />
                        <SetRootButton />

                    </Box>
                    {psmSchemas.map(schema => <DataPsmSchemaItem key={schema} dataPsmSchemaIri={schema}/>)}
                    {psmSchemas.length === 0 &&
                        <Typography color={"textSecondary"}>{t("no schema text")}</Typography>
                    }
                    <Divider style={{margin: "1rem 0 1rem 0"}} />
                    <Trans i18nKey="footer report bug" t={t}>
                        Report a bug on <a href="https://github.com/sstenchlak/schema-generator/issues">GitHub</a>.
                    </Trans>
                </Container>
            </StoreContext.Provider>
        </SnackbarProvider>
    </>;
};

export default App;
