import {createRoot} from 'react-dom/client';
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import "./i18n";
import {BrowserRouter, useRoutes} from 'react-router-dom';
import EditorPage from './editor/components/App';
import ManagerPage from './manager/app';
import {Home} from "./manager/routes/home/home";
import React from "react";
import {Specification} from "./manager/routes/specification/specification";

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

/**
 * Component that routes between manager and editor
 * @constructor
 */
const MainRouter = () => {
    const Page = () => useRoutes([
        { path: "/", element: <ManagerPage><Home/></ManagerPage> },
        { path: "/specification", element: <ManagerPage><Specification/></ManagerPage> },
        { path: "/editor", element: <EditorPage /> }
    ]);

    return <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
        <Page />
    </BrowserRouter>;
}

const root = document.getElementById('root');
createRoot(root!).render(
    //<StrictMode> // https://github.com/atlassian/react-beautiful-dnd/issues/2350
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <MainRouter />
        </ThemeProvider>
    //</StrictMode>
);
