import React, {ReactElement, useEffect, useMemo, useState} from "react";
import {AppBar, Box, Button, Container, Divider, Toolbar, Typography} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import ButtonSetRoot from "./cim-search/button-set-root";
import {DataPsmSchemaItem} from "./data-psm/DataPsmSchemaItem";
import {GenerateArtifacts} from "./artifacts/GenerateArtifacts";
import {SnackbarProvider} from "notistack";
import {LanguageSelector} from "./LanguageSelector";
import {Trans, useTranslation} from "react-i18next";
import {CimAdapter, IriProvider, PrefixIriProvider} from "@model-driven-data/core/cim";
import {SgovAdapter} from "@model-driven-data/core/sgov";
import {httpFetch} from "@model-driven-data/core/io/fetch/fetch-browser";
import {StoreContextInterface} from "./StoreContextInterface";
import {SaveRestore} from "./save-restore";
import OpenInBrowserTwoToneIcon from "@mui/icons-material/OpenInBrowserTwoTone";
import {DialogAppProvider} from "./dialog-app-provider";
import {FederatedObservableStore} from "../store/federated-observable-store";
import {CoreResourceReader, CoreResourceWriter} from "@model-driven-data/core/core";
import {ArtifactPreview} from "./artifacts/artifact-preview";
import {useAsyncMemo} from "../hooks/useAsyncMemo";
import {Configuration} from "../configuration/configuration";
import {SyncMemoryStoreConfigurationStoreBuilder} from "../store/core-stores/sync-memory-store-configuration-store";
import {SCHEMA} from "@model-driven-data/core/data-psm/data-psm-vocabulary";
import {SyncMemoryStore} from "../store/core-stores/sync-memory-store";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {createTheme, ThemeProvider} from "@mui/material/styles";

// @ts-ignore
export const StoreContext = React.createContext<StoreContextInterface>(null);

// Process URL parameters and check if contains configuration on how to create stores
const urlParams = new URLSearchParams(window.location.search);
const configurationUrl = urlParams.get("configuration");
const backlink = urlParams.get("backlink");

const ButtonMenuTheme = createTheme({
    palette: {
        primary: {
            "main": "#fff",
            "contrastText": "rgba(0, 0, 0, 0.87)"
        },
    },
});

console.log(ButtonMenuTheme);


const App: React.FC = () => {
    const { t } = useTranslation('ui');

    const [configuration, configurationIsLoading] = useAsyncMemo(async () => {
        if (configurationUrl) {
            const fetchData = await fetch(configurationUrl);
            return await fetchData.json() as Configuration;
        } else {
            return null;
        }
    }, []);

    const [cim] = useState<{ cimAdapter: CimAdapter, iriProvider: IriProvider }>(() => {
        const iriProvider = new PrefixIriProvider();
        const cimAdapter = new SgovAdapter("https://slovník.gov.cz/sparql", httpFetch);
        cimAdapter.setIriProvider(iriProvider);
        return {iriProvider, cimAdapter};
    });

    const [psmSchemas, setPsmSchemas] = useState<string[]>([]);

    const [store, setStore] = useState<FederatedObservableStore>(new FederatedObservableStore());
    useEffect(() => {(window as any).store = store}, [store]);

    const [artifactPreview, setArtifactPreview] = useState<((store: CoreResourceReader, schema: string) => Promise<ReactElement>) | null>(null);

    useEffect(() => {
        if (configuration) {
            setPsmSchemas([]);
            store.getStores().forEach(s => store.removeStore(s));

            const syncMemoryStores: SyncMemoryStore[] = []
            let rootDataPsmStore: CoreResourceReader | null = null;
            configuration.stores.forEach(s => {
                let coreStore: CoreResourceReader & CoreResourceWriter | null = null;
                if (SyncMemoryStoreConfigurationStoreBuilder.accepts(s.store)) {
                    const builder = new SyncMemoryStoreConfigurationStoreBuilder(s.store);
                    const syncMemoryStore = builder.build();
                    syncMemoryStores.push(syncMemoryStore);
                    coreStore = syncMemoryStore;
                }

                if (coreStore) {
                    store.addStore({
                        store: coreStore,
                        metadata: s.metadata,
                    })
                }

                if (s.metadata.tags.includes("root") && s.metadata.tags.includes("data-psm") && !rootDataPsmStore && coreStore) {
                    rootDataPsmStore = coreStore;
                }
            });

            let isRelevant = true;
            let changeListenerDefined = false;
            const changeListener = () => syncMemoryStores.map(s => s.saveStore());
            Promise.all(syncMemoryStores.map(s => s.loadStore())).then(() => {
                if (isRelevant) {
                    rootDataPsmStore?.listResourcesOfType(SCHEMA).then(setPsmSchemas);

                    store.addEventListener("afterOperationExecuted", changeListener);
                    changeListenerDefined = true;
                }
            });

            return () => {
                changeListenerDefined && store.removeEventListener("afterOperationExecuted", changeListener);
                isRelevant = false;
            };
        }
    }, [configuration, store]);

    const storeContext: StoreContextInterface = useMemo(() => ({
        store,
        setStore,

        psmSchemas,
        setPsmSchemas,

        cim,

        configuration: configuration ?? undefined,
    }), [
        store,
        setStore,

        psmSchemas,
        setPsmSchemas,

        cim,

        configuration,
    ]);

    return <>
        <SnackbarProvider maxSnack={5}>
            <DialogAppProvider>
                <CssBaseline />
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6">
                            {t("title")}
                        </Typography>
                        {backlink && backlink.length > 0 &&
                            <ThemeProvider theme={ButtonMenuTheme}>
                                <Button
                                  color={"primary"}
                                  variant="contained"
                                  startIcon={<ArrowBackIcon />}
                                  sx={{mx: 3}}
                                  onClick={() => window.location.href = backlink}
                                >
                                    {t("back to specification manager")}
                                </Button>
                            </ThemeProvider>
                        }
                        <Box display="flex" sx={{flexGrow: 1}} justifyContent="flex-end">
                            <LanguageSelector />
                        </Box>
                    </Toolbar>
                </AppBar>
                {(!configurationUrl || !configurationIsLoading) &&
                    <StoreContext.Provider value={storeContext}>
                        <Container>
                            <Box height="30px"/>
                            <Box display="flex" flexDirection="row" justifyContent="space-between">
                                <Typography variant="h4" paragraph>slovník.gov.cz</Typography>
                                <GenerateArtifacts artifactPreview={artifactPreview} setArtifactPreview={setArtifactPreview} />
                                <SaveRestore />
                                <ButtonSetRoot />
                            </Box>
                        </Container>
                        <Box sx={{display: "flex"}}>
                            <Container>
                                {psmSchemas.map(schema => <DataPsmSchemaItem key={schema} dataPsmSchemaIri={schema}/>)}
                            </Container>
                            <ArtifactPreview artifactPreview={artifactPreview} setArtifactPreview={setArtifactPreview} />
                        </Box>
                        <Container>
                            {psmSchemas.length === 0 &&
                                <Typography color={"textSecondary"}>
                                    <Trans i18nKey="no schema text" t={t}>
                                        _ <strong /> _ <OpenInBrowserTwoToneIcon fontSize="small" /> _
                                    </Trans>
                                </Typography>
                            }
                            <Divider style={{margin: "1rem 0 1rem 0"}} />
                            <Trans i18nKey="footer report bug" t={t}>
                                Report a bug on <a href="https://github.com/sstenchlak/schema-generator/issues">GitHub</a>.
                            </Trans>
                        </Container>
                    </StoreContext.Provider>
                }
            </DialogAppProvider>
        </SnackbarProvider>
    </>;
};

export default App;
