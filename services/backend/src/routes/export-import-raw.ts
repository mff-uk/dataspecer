import express from "express";
import { asyncHandler } from "../utils/async-handler";
import { PackageExporter } from "../export-import/export";
import { resourceModel } from "../main";
import z from "zod";

/**
 * Exports whole package as a zip.
 */
export const exportPackageResource = asyncHandler(async (request: express.Request, response: express.Response) => {
  const querySchema = z.object({
    iri: z.string().min(1),
  });

  const query = querySchema.parse(request.query);

  const exporter = new PackageExporter(resourceModel);
  const buffer = await exporter.doExport(query.iri);

  response.type("application/zip").send(buffer);
});
