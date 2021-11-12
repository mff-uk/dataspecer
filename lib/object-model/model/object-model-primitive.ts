import {ObjectModelResource} from "./object-model-resource";

export class ObjectModelPrimitive extends ObjectModelResource {

  private static readonly TYPE = "primitive-data-type";

  /**
   * Used for type checking.
   */
  type: string = ObjectModelPrimitive.TYPE;

  /**
   * IRI of the data type like http://www.w3.org/2001/XMLSchema#string .
   */
  dataType: string | null;

  static is(object: any | null): object is ObjectModelPrimitive {
    return object != null && object?.type === ObjectModelPrimitive.TYPE;
  }

}
