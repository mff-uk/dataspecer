import React, {useMemo, useState} from "react";
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
import {StoreContextInterface} from "./StoreContextInterface";
import {FederatedObservableCoreModelReaderWriter} from "../store/federated-observable-store";
import {SaveRestore} from "./save-restore";
import OpenInBrowserTwoToneIcon from "@material-ui/icons/OpenInBrowserTwoTone";

// @ts-ignore
export const StoreContext = React.createContext<StoreContextInterface>(null);

const App: React.FC = () => {
    const { t } = useTranslation('ui');

    const [cim] = useState<{ cimAdapter: CimAdapter, iriProvider: IriProvider }>(() => {
        const iriProvider = new PrefixIriProvider();
        const cimAdapter = new SgovAdapter("https://slovník.gov.cz/sparql", httpFetch);
        cimAdapter.setIriProvider(iriProvider);
        return {iriProvider, cimAdapter};
    });

    const [psmSchemas, setPsmSchemas] = useState<string[]>([]);

    const [store, setStore] = useState<FederatedObservableCoreModelReaderWriter>(new FederatedObservableCoreModelReaderWriter());

    const storeContext: StoreContextInterface = useMemo(() => ({
        store,
        setStore,

        psmSchemas,
        setPsmSchemas,

        cim,
    }), [
        store,
        setStore,

        psmSchemas,
        setPsmSchemas,

        cim,
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
            <StoreContext.Provider value={storeContext}>
                <Container>
                    <Box height="30px"/>
                    <Box display="flex" flexDirection="row" justifyContent="space-between">
                        <Typography variant="h4" paragraph>slovník.gov.cz</Typography>
                        <GenerateArtifacts />
                        <SaveRestore />
                        <SetRootButton />
                    </Box>
                    {psmSchemas.map(schema => <DataPsmSchemaItem key={schema} dataPsmSchemaIri={schema}/>)}
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
        </SnackbarProvider>
    </>;
};

export default App;
