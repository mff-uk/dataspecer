import { BlobModel } from "./blob-model.ts";
import { Model } from "./model.ts";
import { PackageModel } from "./package-model.ts";

export interface BaseModel extends Model {
  asBlobModel(): Promise<BlobModel>;
  asPackageModel(): Promise<PackageModel>;
}