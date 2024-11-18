import { Package } from "../../project";
import { TypedObject } from "./typed-object";

export interface EntityModelFactory {

  createFromPackage<T extends TypedObject>(value: Package, types: string[]): Promise<T | null>;

  /**
   * Create model using Dataspecer API JSON response.
   *
   * @param payload
   * @param types
   */
  createFromApiJsonObject<T extends TypedObject>(payload: object, types: string[]): Promise<T | null>;

}

