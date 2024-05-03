import express from "express";
const ldkitRouter = express.Router();
import { LDkitGenerator } from "@dataspecer/ldkit";

ldkitRouter.get("/:aggregateName", (req, res) => {
  
  console.log("Received request: ", req.headers);
  
  const aggregateName = req.params["aggregateName"];

  //new LDkitGenerator().generateToStream();

  res.json(JSON.stringify({
    objectName: "CatalogSchema",
    objectFilepath: "./generated/src/dal/CatalogSchema.ts"
  }));

});

export default ldkitRouter;