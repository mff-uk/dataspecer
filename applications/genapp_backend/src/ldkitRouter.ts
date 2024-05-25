import express from "express";
const ldkitRouter = express.Router();
import { LDkitGenerator } from "@dataspecer/ldkit";

ldkitRouter.get("/:aggregateName", (req, res) => {
  
  console.log("Received request: ", req.headers);
  
  const aggregateName = req.params["aggregateName"];

  //new LDkitGenerator().generateDalLayerArtifact(aggregateName);

  const result = {
    fileName: "DatasetSchema.ts",
    exportedObjectName: "DatasetSchema",
    sourceText: `
    export const DatasetSchema = {
      "@type": "http://www.w3.org/ns/dcat#Dataset",
      title: {
          "@id": "http://purl.org/dc/terms/title",
          "@multilang": true
      },
      klicove_slovo: {
          "@id": "http://www.w3.org/ns/dcat#keyword",
          "@array": true,
          "@multilang": true
      },
      distribuce: {
          "@id": "http://www.w3.org/ns/dcat#distribution",
          "@array": true,
          "@schema": {
              "@type": "http://www.w3.org/ns/dcat#Distribution",
              title: {
                  "@id": "http://purl.org/dc/terms/title",
                  "@multilang": true
              },
              url_souboru_ke_stazeni: {
                  "@id": "http://www.w3.org/ns/dcat#downloadURL",
                  "@array": true,
                  "@schema": {
                      "@type": "http://www.w3.org/2002/07/owl#Thing"
                  }
              }
          }
      }
    } as const;
    `
  };

  res.json(result);
});

export default ldkitRouter;