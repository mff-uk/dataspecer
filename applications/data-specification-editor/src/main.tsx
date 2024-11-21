import {createRoot} from 'react-dom/client';
import React from "react";
import {Application} from "./application";
import "./i18n";
import {initReturnBack} from "./components/return-back/init";

initReturnBack();

const root = document.getElementById('root');
createRoot(root!).render(<Application />);
