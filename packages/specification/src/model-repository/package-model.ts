import { BaseModel } from "./base-model.ts";
import { BlobModel } from "./blob-model.ts";
import { Model } from "./model.ts";

/**
 * Represents model that is a package and contains other models.
 */
export interface PackageModel extends Model, BlobModel {
  getSubResources(): Promise<BaseModel[]>;
}