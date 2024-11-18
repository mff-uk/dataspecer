import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import React, {createContext, useCallback, useEffect, useState} from "react";
import {BrowserRouter, useRoutes} from "react-router-dom";
import ManagerPage from "./manager/app";
import {Home} from "./manager/routes/home/home";
import {Specification} from "./manager/routes/specification/specification";
import EditorPage from "./editor/components/App";
import {httpFetch} from "@dataspecer/core/io/fetch/fetch-browser";
import {getDefaultConfiguration, mergeConfigurations} from "@dataspecer/core/configuration/utils";
import {getDefaultConfigurators} from "./configurators";
import { SnackbarProvider } from "notistack";
import { StructureEditorBackendService } from "./specification";

export const BackendConnectorContext = React.createContext(null as unknown as StructureEditorBackendService);

// This is the class that will be used to fetch data from the backend.
export const BackendPackageServiceContext = React.createContext(null as unknown as StructureEditorBackendService);
export const RefreshContext = React.createContext(null as unknown as () => void);
/**
 * Contains merged default configuration from the source code and the configuration from the backend.
 */
// @ts-ignore
export const DefaultConfigurationContext = createContext<object>(null);


const useDefaultConfiguration = (backendConnector: StructureEditorBackendService) => {
    const [context, setContext] = useState<object>(() => getDefaultConfiguration(getDefaultConfigurators()));
    useEffect(() => {
        backendConnector.readDefaultConfiguration().then(configuration =>
            setContext(mergeConfigurations(
                getDefaultConfigurators(),
                getDefaultConfiguration(getDefaultConfigurators()),
                configuration
            ))
        );
    }, [backendConnector]);
    return context;
}

const PACKAGE_ROOT = "http://dataspecer.com/packages/local-root";

export const Application = () => {
    const [backendConnector, setBackendConnector] = useState(new StructureEditorBackendService(process.env.REACT_APP_BACKEND, httpFetch, PACKAGE_ROOT));
    const refresh = useCallback(() => setBackendConnector(new StructureEditorBackendService(process.env.REACT_APP_BACKEND, httpFetch, PACKAGE_ROOT)), []);

    const defaultConfiguration = useDefaultConfiguration(backendConnector);

    useEffect(() => {
        document.body.style.backgroundColor = theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme]);

    return (
        //<StrictMode> // https://github.com/atlassian/react-beautiful-dnd/issues/2350
        <ThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={3}>
                <RefreshContext.Provider value={refresh}>
                    <BackendConnectorContext.Provider value={backendConnector}>
                        <DefaultConfigurationContext.Provider value={defaultConfiguration}>
                            <CssBaseline />
                            <MainRouter />
                        </DefaultConfigurationContext.Provider>
                    </BackendConnectorContext.Provider>
                </RefreshContext.Provider>
            </SnackbarProvider>
        </ThemeProvider>
        //</StrictMode>
    );
}


/**
 * Component that routes between manager and editor
 * @constructor
 */
const MainRouter = () => {
    const Page = () => useRoutes([
        {path: process.env.REACT_APP_MANAGER_BASE_URL + "", element: <ManagerPage><Home/></ManagerPage>},
        {path: process.env.REACT_APP_MANAGER_BASE_URL + "/specification", element: <ManagerPage><Specification/></ManagerPage>},
        {path: process.env.REACT_APP_STRUCTURE_EDITOR_BASE_URL, element: <EditorPage/>}
    ]);

    return <BrowserRouter basename={"/"}>
        <Page/>
    </BrowserRouter>;
}


const theme = createTheme({
    palette: {
        "primary": {
            "light": "#7986cb",
            "main": "#3f51b5",
            "dark": "#303f9f",
            "contrastText": "#fff"
        },
        "secondary": {
            "light": "#ff4081",
            "main": "#f50057",
            "dark": "#c51162",
            "contrastText": "#fff"
        },
        "error": {
            "light": "#e57373",
            "main": "#f44336",
            "dark": "#d32f2f",
            "contrastText": "#fff"
        },
        "warning": {
            "light": "#ffb74d",
            "main": "#ff9800",
            "dark": "#f57c00",
            "contrastText": "rgba(0, 0, 0, 0.87)"
        },
        "info": {
            "light": "#64b5f6",
            "main": "#2196f3",
            "dark": "#1976d2",
            "contrastText": "#fff"
        },
        "success": {
            "light": "#81c784",
            "main": "#4caf50",
            "dark": "#388e3c",
            "contrastText": "rgba(0, 0, 0, 0.87)"
        },

    }
});
