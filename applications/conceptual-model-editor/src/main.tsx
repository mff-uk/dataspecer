import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Application from "./page";

import "./main.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Application />
  </StrictMode>,
);
