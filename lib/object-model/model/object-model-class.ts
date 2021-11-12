import {ObjectModelResource} from "./object-model-resource";
import {ObjectModelProperty} from "./object-model-property";

export class ObjectModelClass extends ObjectModelResource {

  private static readonly TYPE = "object-model-class";

  /**
   * Used for type checking.
   */
  type: string = ObjectModelClass.TYPE;

  /**
   * Class can extend other classes, the properties of other classes
   * are not included in this class.
   */
  extends: ObjectModelClass [] = [];

  /**
   * Properties declared on this class directly. The list is ordered.
   */
  properties: ObjectModelProperty[] = [];

  /**
   * If set to true values of this class are available in a codelist.
   */
  isCodelist = false;

  static is(object: any | null): object is ObjectModelClass {
    return object !== null && object?.type === ObjectModelClass.TYPE;
  }

}
