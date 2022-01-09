import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import {CssBaseline} from "@mui/material";

require('dotenv').config();

// Emulate default values
const defaultValues = {
    REACT_APP_BACKEND: "http://localhost:3100",
    REACT_APP_SCHEMA_GENERATOR: "localhost http://localhost:3000/"
}

export const processEnv = {
    ...defaultValues,
    ...process.env
}

ReactDOM.render(
    <React.StrictMode>
        <CssBaseline/>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);
