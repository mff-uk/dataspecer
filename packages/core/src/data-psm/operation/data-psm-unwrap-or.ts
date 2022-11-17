import {CoreOperation, CoreOperationResult, CoreResource, CoreTyped} from "../../core";
import * as PSM from "../data-psm-vocabulary";

/**
 * Removes {@link DataPsmOr} and places its only child in place of it.
 */
export class DataPsmUnwrapOr extends CoreOperation {
  static readonly TYPE = PSM.UNWRAP_OR;

  dataPsmOr: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmUnwrapOr.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmUnwrapOr {
    return resource?.types.includes(DataPsmUnwrapOr.TYPE);
  }
}

export class DataPsmUnwrapOrResult extends CoreOperationResult {
  static readonly TYPE = PSM.UNWRAP_OR_RESULT;

  constructor() {
    super();
    this.types.push(DataPsmUnwrapOrResult.TYPE);
  }

  static is(
    resource: CoreTyped | null
  ): resource is DataPsmUnwrapOrResult {
    return resource?.types.includes(DataPsmUnwrapOrResult.TYPE);
  }
}
