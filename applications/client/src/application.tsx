import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import React, {createContext, useEffect, useState} from "react";
import {BrowserRouter, useRoutes} from "react-router-dom";
import ManagerPage from "./manager/app";
import {Home} from "./manager/routes/home/home";
import {Specification} from "./manager/routes/specification/specification";
import EditorPage from "./editor/components/App";
import {BackendConnector} from "@dataspecer/backend-utils/connectors/backend-connector";
import {httpFetch} from "@dataspecer/core/io/fetch/fetch-browser";
import {getDefaultConfiguration, mergeConfigurations} from "@dataspecer/core/configuration/utils";
import {createDefaultConfigurators} from "@dataspecer/core/configuration/configurator-factory";

export const BackendConnectorContext = React.createContext(null as unknown as BackendConnector);
// @ts-ignore
export const DefaultConfigurationContext = createContext<object>(null);


const useDefaultConfiguration = (backendConnector: BackendConnector) => {
    const [context, setContext] = useState<object>(() => getDefaultConfiguration(createDefaultConfigurators()));
    useEffect(() => {
        backendConnector.readDefaultConfiguration().then(configuration =>
            setContext(mergeConfigurations(
                createDefaultConfigurators(),
                getDefaultConfiguration(createDefaultConfigurators()),
                configuration
            ))
        );
    }, [backendConnector]);
    return context;
}

export const Application = () => {
    const [backendConnector] = useState(new BackendConnector(process.env.REACT_APP_BACKEND, httpFetch));
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
            <BackendConnectorContext.Provider value={backendConnector}>
                <DefaultConfigurationContext.Provider value={defaultConfiguration}>
                    <CssBaseline />
                    <MainRouter />
                </DefaultConfigurationContext.Provider>
            </BackendConnectorContext.Provider>
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
        {path: "/", element: <ManagerPage><Home/></ManagerPage>},
        {path: "/specification", element: <ManagerPage><Specification/></ManagerPage>},
        {path: "/editor", element: <EditorPage/>}
    ]);

    return <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
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
