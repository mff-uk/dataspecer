import React, {ReactElement, useEffect, useState} from "react";
import {AppBar, Box, Button, Container, Divider, Toolbar, Typography} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import ButtonSetRoot from "./cim-search/button-set-root";
import {DataPsmSchemaItem} from "./data-psm/DataPsmSchemaItem";
import {GenerateArtifacts} from "./artifacts/GenerateArtifacts";
import {SnackbarProvider} from "notistack";
import {LanguageSelector} from "./LanguageSelector";
import {Trans, useTranslation} from "react-i18next";
import OpenInBrowserTwoToneIcon from "@mui/icons-material/OpenInBrowserTwoTone";
import {DialogAppProvider} from "./dialog-app-provider";
import {ArtifactPreview} from "./artifacts/artifact-preview";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {useLocalConfiguration} from "../configuration/local-configuration";
import {useProvidedConfiguration} from "../configuration/provided-configuration";
import {Configuration} from "../configuration/configuration";
import {StoreContext} from "@dataspecer/federated-observable-store-react/store"

// @ts-ignore default value
export const ConfigurationContext = React.createContext<Configuration>(null);

// Process URL parameters and check if contains configuration on how to create stores
const urlParams = new URLSearchParams(window.location.search);
const dataSpecificationIri = urlParams.get("data-specification");
const dataPsmSchemaIri = urlParams.get("data-psm-schema");
const backlink = urlParams.get("backlink");

const ButtonMenuTheme = createTheme({
    palette: {
        primary: {
            "main": "#fff",
            "contrastText": "rgba(0, 0, 0, 0.87)"
        },
    },
});

const App: React.FC = () => {
    const { t, i18n } = useTranslation('ui');

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

    const [artifactPreview, setArtifactPreview] = useState<((configuration: Configuration) => Promise<ReactElement>) | null>(null);

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
                <ConfigurationContext.Provider value={configuration}>
                    <StoreContext.Provider value={configuration.store}>
                        <Container>
                            <Box height="30px"/>
                            <Box display="flex" flexDirection="row" justifyContent="space-between">
                                <Typography variant="h4" paragraph>slovník.gov.cz</Typography>
                                <GenerateArtifacts artifactPreview={artifactPreview} setArtifactPreview={setArtifactPreview} />
                                <ButtonSetRoot />
                            </Box>
                        </Container>
                        <Box sx={{display: "flex"}}>
                            <Container>
                                {configuration.dataPsmSchemaIri && <DataPsmSchemaItem dataPsmSchemaIri={configuration.dataPsmSchemaIri}/>}
                            </Container>
                            <ArtifactPreview artifactPreview={artifactPreview} setArtifactPreview={setArtifactPreview} />
                        </Box>
                        <Container>
                            {configuration.dataPsmSchemaIri === null &&
                                <Typography color={"textSecondary"}>
                                    <Trans i18nKey="no schema text" t={t}>
                                        _ <strong /> _ <OpenInBrowserTwoToneIcon fontSize="small" /> _
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
                    </StoreContext.Provider>
                </ConfigurationContext.Provider>
            </DialogAppProvider>
        </SnackbarProvider>
    </>;
};

export default App;
