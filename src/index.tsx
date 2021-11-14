import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import {CssBaseline} from "@mui/material";

require('dotenv').config();

ReactDOM.render(
    <React.StrictMode>
        <CssBaseline/>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);
