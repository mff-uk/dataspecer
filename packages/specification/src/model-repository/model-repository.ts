import { BaseModel } from "./base-model.ts";

export interface ModelRepository {
  getModelById(modelId: string): Promise<BaseModel | null>;
}