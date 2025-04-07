import { BaseModel } from "./base-model";
import { BlobModel } from "./blob-model";
import { Model } from "./model";

/**
 * Represents model that is a package and contains other models.
 */
export interface PackageModel extends Model, BlobModel {
  getSubResources(): Promise<BaseModel[]>;
}