import express from "express";
import { readFileSync } from "fs";
import { asyncHandler } from "../utils/async-handler";
import { Package } from "@dataspecer/core-v2/project";

export const getPackage = asyncHandler(
  async (request: express.Request, response: express.Response) => {
    // console.log("got request", request.query, request.body);
    if (request.query.packageId) {
      const packageId = String(request.query.packageId);
      const pckg = JSON.parse(readFileSync("./out2.json", "utf-8"));
      console.log(pckg);
      const pckg2 = {
        id: packageId,
        name: { cs: packageId, en: packageId },
        tags: [],
        subPackages: [],
        providesSemanticModel: false,
      };
      if (pckg) {
        response.send(pckg);
        return;
      }
    }
    response.status(404);
    return;
  }
);

export const writePackage = asyncHandler(
  async (request: express.Request, response: express.Response) => {
    console.log(JSON.stringify(request.body));
    const packageId = String(request.query.packageId);
    const pckg = request.body as Package;
    // console.log(packageId, pckg);
    if (pckg) response.send(pckg);
    else {
      response.status(404);
      return;
    }
  }
);
