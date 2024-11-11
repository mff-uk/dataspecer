import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Application from "./page";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Application />
  </StrictMode>,
);
