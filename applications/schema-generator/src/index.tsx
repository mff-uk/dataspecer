import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import './i18n';
import "dotenv-defaults/config";

const root = document.getElementById('root') as HTMLElement;
ReactDOM.createRoot(root).render(
    //<React.StrictMode> // https://github.com/atlassian/react-beautiful-dnd/issues/2350
        <App />
    //</React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
