import { BlobModel } from "./blob-model";
import { Model } from "./model";
import { PackageModel } from "./package-model";

export interface BaseModel extends Model {
  asBlobModel(): Promise<BlobModel>;
  asPackageModel(): Promise<PackageModel>;
}