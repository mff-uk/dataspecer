import React, {useCallback, useEffect, useMemo, useState} from "react";
import {AppBar, Box, Container, Divider, Toolbar, Typography} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import SetRootButton from "./cimSearch/SetRootButton";
import {DataPsmSchemaItem} from "./dataPsm/DataPsmSchemaItem";
//import {GenerateArtifacts} from "./generateArtifacts/GenerateArtifacts.tsx_";
import {SnackbarProvider} from "notistack";
// import {LabelAndDescriptionLanguageStrings} from "./psmDetail/LabelDescriptionEditor.tsx";
import {LanguageSelector} from "./LanguageSelector";
import {Trans, useTranslation} from "react-i18next";
import {CimAdapter, IriProvider, PrefixIriProvider} from "model-driven-data/cim";
import {SgovAdapter} from "model-driven-data/sgov";
import {httpFetch} from "model-driven-data/io/fetch/fetch-browser";
import {CoreResource, CoreResourceReader, CoreResourceWriter} from "model-driven-data/core";
import {PimMemoryStore} from "model-driven-data/pim/store/memory-store/pim-memory-store";
import {DataPsmMemoryStore} from "model-driven-data/data-psm/store";
import {PimClass} from "model-driven-data/pim/model";
import {executeCompositeCreateSchema} from "../operations/composite-create-schema";
import {ModelObserverContainer} from "../ModelObserverContainer";
import {executeCompositeCreateRootClass} from "../operations/composite-create-root-class";
import {executeCompositeAddClassSurroundings} from "../operations/composite-add-class-surroundings";
import {DataPsmClass} from "model-driven-data/data-psm/model";
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

interface StoreContextInterface {
    addSurroundings: (forDataPsmClass: DataPsmClass, sourcePimModel: CoreResourceReader, resourcesToAdd: CoreResource[]) => void,
    setRootClass: (rootPimClass: PimClass) => void,
    dataPsm: CoreResourceReader,
    pim: CoreResourceReader,
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
    deleteAssociationClass:  (operation: CompositeDeleteAssociationClass) => void,
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

    // PIM model

    const [pim, setPim] = useState<CoreResourceReader & CoreResourceWriter>(new PimMemoryStore());

    // data-PSM model

    const [dataPsm, setDataPsm] = useState<CoreResourceReader & CoreResourceWriter>(new DataPsmMemoryStore());
    const [psmSchemas, setPsmSchemas] = useState<string[]>([]);

    const models = useMemo(() => ({
        pim: new ModelObserverContainer(pim),
        dataPsm: new ModelObserverContainer(dataPsm),
    }), [pim, dataPsm]); // todo split to two memos

    // Define operations

    const setRootClass = useCallback(async (rootPimClass: PimClass) => {
        const schemaIri = await executeCompositeCreateSchema(models, {pimBaseIri: "//pim/", dataPsmBaseIri: "//dataPsm/"});
        await executeCompositeCreateRootClass(models, {pimClass: rootPimClass});

        setPsmSchemas([schemaIri]);
    }, [models]);
    const addSurroundings = useCallback(async (forDataPsmClass: DataPsmClass, sourcePimModel: CoreResourceReader, resourcesToAdd: CoreResource[]) => {
        console.log("addSurroundings");
        await executeCompositeAddClassSurroundings(models, {
            forDataPsmClass,
            sourcePimModel,
            resourcesToAdd,
        });
    },[models]);
    const deleteAttribute = useCallback((operation: CompositeDeleteAttribute) => executeCompositeDeleteAttribute(models, operation), [models]);
    const updateOrder = useCallback((operation: CompositeUpdateOrder) => executeCompositeUpdateOrder(models, operation), [models]);
    const updateDataPsmLabelAndDescription = useCallback((operation: CompositeUpdateDataPsmLabelAndDescription) => executeCompositeUpdateDataPsmLabelAndDescription(models, operation), [models]);
    const updatePimLabelAndDescription = useCallback((operation: CompositeUpdatePimLabelAndDescription) => executeCompositeUpdatePimLabelAndDescription(models, operation), [models]);
    const updateResourceTechnicalLabel = useCallback((operation: CompositeUpdateResourceTechnicalLabel) => executeCompositeUpdateResourceTechnicalLabel(models, operation), [models]);
    const deleteAssociationClass = useCallback((operation: CompositeDeleteAssociationClass) => executeCompositeDeleteAssociationClass(models, operation), [models]);

    // todo debug function
    useEffect(() => {
        // @ts-ignore
        window.DPSM = async () => {
            const resources = await dataPsm.listResources();
            for (const resourceIri of resources) {
                const resource = await dataPsm.readResource(resourceIri);
                console.info(resource);
            }
        };
    }, [dataPsm]);

    // todo debug function
    useEffect(() => {
        // @ts-ignore
        window.PIM = async () => {
            const resources = await pim.listResources();
            for (const resourceIri of resources) {
                const resource = await pim.readResource(resourceIri);
                console.info(resource);
            }
        };
    }, [pim]);

    // @ts-ignore
    useEffect(() => window.models = models, [models]);

    const storeContextData: StoreContextInterface = useMemo(() => ({
        deleteAttribute,
        addSurroundings,
        setRootClass,
        dataPsm,
        pim,
        cim,
        models,
        updateOrder,
        updateDataPsmLabelAndDescription,
        updatePimLabelAndDescription,
        updateResourceTechnicalLabel,
        deleteAssociationClass,
    }), [
        deleteAttribute,
        addSurroundings,
        setRootClass,
        dataPsm,
        pim,
        cim,
        models,
        updateOrder,
        updateDataPsmLabelAndDescription,
        updatePimLabelAndDescription,
        updateResourceTechnicalLabel,
        deleteAssociationClass,
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
                        <GenerateArtifacts store={store} setStore={setStore} />
                        */}
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
