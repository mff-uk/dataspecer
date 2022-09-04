import React, {useContext, useEffect, useMemo, useState} from "react";
import {AppBar, Box, Button, Container, Divider, Toolbar, Typography} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import ButtonSetRoot from "./cim-search/button-set-root";
import {DataPsmSchemaItem} from "./data-psm/schema";
import {GenerateArtifactsMenu} from "./artifacts/generate-artifacts-menu";
import {SnackbarProvider} from "notistack";
import {LanguageSelector} from "./language-selector";
import {Trans, useTranslation} from "react-i18next";
import {DialogAppProvider} from "./dialog-app-provider";
import {MultipleArtifactsPreview} from "./artifacts/multiple-artifacts-preview";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {useLocalConfiguration} from "../configuration/providers/local-configuration";
import {useProvidedConfiguration} from "../configuration/providers/provided-configuration";
import {Configuration} from "../configuration/configuration";
import {StoreContext} from "@dataspecer/federated-observable-store-react/store"
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmSchema} from "@dataspecer/core/data-psm/model";
import {SettingsMenu} from "./settings/settings-menu";
import {SettingsContext, useApplicationSettings} from "./settings/settings";
import {Link} from "react-router-dom";

// @ts-ignore default value
export const ConfigurationContext = React.createContext<Configuration>(null);

const ButtonMenuTheme = createTheme({
    palette: {
        primary: {
            "main": "#fff",
            "contrastText": "rgba(0, 0, 0, 0.87)"
        },
    },
});

const AppContent: React.FC = () => {
    // List of generators that their artifacts will be shown as a live preview next to the modelled schema
    const [artifactPreview, setArtifactPreview] = useState<string[]>([]);

    const configuration = useContext(ConfigurationContext);
    const {t} = useTranslation('ui');

    const {resource: root} = useResource<DataPsmSchema>(configuration.dataPsmSchemaIri);
    const rootHasPart = root && root.dataPsmParts.length > 0;

    return <>
        <Container>
            <Box height="30px"/>
            <Box display="flex" flexDirection="row" justifyContent="space-between">
                <Typography variant="h4" paragraph>slovník.gov.cz</Typography>
                <div>
                    <div style={{display: "flex", gap: "1rem"}}>
                        <GenerateArtifactsMenu artifactPreview={artifactPreview} setArtifactPreview={setArtifactPreview} />
                        <ButtonSetRoot />
                    </div>
                </div>
            </Box>
        </Container>
        <Box sx={{display: "flex"}}>
            <Container>
                {configuration.dataPsmSchemaIri && rootHasPart && <DataPsmSchemaItem dataPsmSchemaIri={configuration.dataPsmSchemaIri}/>}
            </Container>
            <MultipleArtifactsPreview artifactPreview={artifactPreview} setArtifactPreview={setArtifactPreview} />
        </Box>
        <Container>
            {!rootHasPart &&
                <Typography color={"textSecondary"} sx={{py: 4}}>
                    <Trans i18nKey="no schema text" t={t}>
                        _ <strong /> _
                    </Trans>
                </Typography>
            }
            <Divider style={{margin: "1rem 0 1rem 0"}} />
            <Trans i18nKey="footer report bug" t={t}>
                Report a bug on <a href="https://github.com/mff-uk/dataspecer/issues">GitHub</a>.
            </Trans>
            {process.env.REACT_APP_DEBUG_VERSION !== undefined &&
                <>
                    {" | "}{t("version")}: <span>{process.env.REACT_APP_DEBUG_VERSION}</span>
                </>
            }
        </Container>
    </>
}

/**
 * Main component that renders the whole editor UI. The editor is only one-page application, therefore no router is
 * required.
 */
const App: React.FC = () => {
    const { t, i18n } = useTranslation('ui');

    /**
     * Decode URL that configures which structure shall be edited
     */

    const url = window.location.search;
    const {dataSpecificationIri, dataPsmSchemaIri} = useMemo(() => {
        const urlParams = new URLSearchParams(url);
        const dataSpecificationIri = urlParams.get("data-specification");
        const dataPsmSchemaIri = urlParams.get("data-psm-schema");
        return {dataSpecificationIri, dataPsmSchemaIri};
    }, [url]);

    /**
     * Based on a configuration type, corresponding hook provides a configuration for the app. The configuration
     * consists of store, cim adapter and a list of specifications as well as current data psm schema.
     */
    const configurationType: "local" | "provided" = (dataSpecificationIri && dataPsmSchemaIri) ? "provided" : "local";
    const configuration = {
        ...useLocalConfiguration(configurationType === "local"),
        ...useProvidedConfiguration(configurationType === "provided", dataSpecificationIri, dataPsmSchemaIri)
    } as Configuration;

    useEffect(() => {(window as any).store = configuration.store}, [configuration.store]);

    const operationContext = configuration.operationContext;
    useEffect(() => {
        operationContext.labelRules = {
            languages: i18n.languages as string[],
            namingConvention: "snake_case",
            specialCharacters: "allow",
        };
    }, [operationContext, i18n.languages]);

    const applicationSettings = useApplicationSettings();

    return <>
        <SnackbarProvider maxSnack={5}>
            <SettingsContext.Provider value={applicationSettings}>
                <DialogAppProvider>
                    <CssBaseline />
                    <AppBar position="static">
                        <Toolbar>
                            <Typography variant="h6" sx={{fontWeight: "normal"}}>
                                <strong>Dataspecer</strong> {t("title")}
                            </Typography>
                            <ThemeProvider theme={ButtonMenuTheme}>
                                <Button
                                  color={"primary"}
                                  variant="contained"
                                  startIcon={<ArrowBackIcon />}
                                  sx={{mx: 3}}
                                  component={Link}
                                  to={dataSpecificationIri ? `/specification?dataSpecificationIri=${encodeURIComponent(dataSpecificationIri)}` : "/"}
                                >
                                    {t("back to specification manager")}
                                </Button>
                            </ThemeProvider>
                            <Box display="flex" sx={{flexGrow: 1, gap: 4}} justifyContent="flex-end">
                                <SettingsMenu />
                                <LanguageSelector />
                            </Box>
                        </Toolbar>
                    </AppBar>
                    <ConfigurationContext.Provider value={configuration}>
                        <StoreContext.Provider value={configuration.store}>
                            <AppContent />
                        </StoreContext.Provider>
                    </ConfigurationContext.Provider>
                </DialogAppProvider>
            </SettingsContext.Provider>
        </SnackbarProvider>
    </>;
};

export default App;
