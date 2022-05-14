import {CoreOperation, CoreOperationResult, CoreResource, CoreTyped} from "../../core";
import * as PSM from "../data-psm-vocabulary";

/**
 * Creates {@link DataPsmInclude} to already existing class.
 */
export class DataPsmCreateInclude extends CoreOperation {
  static readonly TYPE = PSM.CREATE_INCLUDE;

  dataPsmNewIri: string | null = null;

  dataPsmOwner: string | null = null;

  dataPsmIncludes: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmCreateInclude.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmCreateInclude {
    return resource?.types.includes(DataPsmCreateInclude.TYPE);
  }
}

export class DataPsmCreateIncludeResult extends CoreOperationResult {
  static readonly TYPE = PSM.CREATE_INCLUDE_RESULT;

  readonly createdDataPsmInclude: string;

  constructor(dataPsmInclude: string) {
    super();
    this.types.push(DataPsmCreateIncludeResult.TYPE);
    this.createdDataPsmInclude = dataPsmInclude;
  }

  static is(
    resource: CoreTyped | null
  ): resource is DataPsmCreateIncludeResult {
    return resource?.types.includes(DataPsmCreateIncludeResult.TYPE);
  }
}
