import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Application from "./page";
import { ConceptualModelEditor } from "./conceptual-model-editor";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConceptualModelEditor />
  </StrictMode>,
);
