import {ObjectModelResource} from "./object-model-resource";
import {ObjectModelClass} from "./object-model-class";
import {ObjectModelPrimitive} from "./object-model-primitive";
import {ObjectModelInterval} from "./object-model-interval";

export class ObjectModelProperty extends ObjectModelResource {

  /**
   * A single property can have multiple types, for example by inheritance
   * or data-psm choice.
   */
  dataTypes: (ObjectModelClass | ObjectModelPrimitive)[] = [];

  cardinality: ObjectModelInterval = {
    "min": 0,
    "max": null,
  };

}