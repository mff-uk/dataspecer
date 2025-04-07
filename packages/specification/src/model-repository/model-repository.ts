import { BaseModel } from "./base-model";

export interface ModelRepository {
  getModelById(modelId: string): Promise<BaseModel | null>;
}