import { generate } from "@dataspecer/core-v2/semantic-model/lightweight-owl";
import { simplifiedSemanticModelToSemanticModel } from "@dataspecer/core-v2/simplified-semantic-model";
import express from "express";
import { asyncHandler } from "../utils/async-handler.ts";

export const getlightweightFromSimplified = asyncHandler(async (request: express.Request, response: express.Response) => {
  const entities = simplifiedSemanticModelToSemanticModel(request.body, {});
  const result = await generate(Object.values(entities), { baseIri: "", iri: "" });
  response.type("text/turtle").send(result);
  return;
});
