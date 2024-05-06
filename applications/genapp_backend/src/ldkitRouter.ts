import express from "express";
const ldkitRouter = express.Router();
import { LDkitGenerator } from "@dataspecer/ldkit";

ldkitRouter.get("/:aggregateName", (req, res) => {
  
  console.log("Received request: ", req.headers);
  
  const aggregateName = req.params["aggregateName"];

  //new LDkitGenerator().generateDalLayerArtifact();

  const result = {
    fileName: "Dataset.ts",
    exportedObjectName: "DatasetSchema",
    sourceText: `
    const DatasetSchema = {
        iri: "",
        klicove_slovo: ""
    }

    export default DatasetSchema;
    `
  };

  res.json(result);
});

export default ldkitRouter;