import {createRoot} from 'react-dom/client';
import React from "react";
import {Application} from "./application";
import "./i18n";

const root = document.getElementById('root');
createRoot(root!).render(<Application />);
