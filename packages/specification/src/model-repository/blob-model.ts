import { Model } from "./model.ts";

/**
 * Model consisting of blob data.
 */
export interface BlobModel extends Model {
  getJsonBlob(name?: string): Promise<unknown>;
}

export interface WritableBlobModel extends BlobModel {
  setJsonBlob(data: unknown, name?: string): Promise<void>;
}