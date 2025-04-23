import { createRoot } from 'react-dom/client';
import { Application } from "./application";
import { initReturnBack } from "./components/return-back/init";
import "./i18n";

initReturnBack();

const root = document.getElementById('root');
createRoot(root!).render(<Application />);
