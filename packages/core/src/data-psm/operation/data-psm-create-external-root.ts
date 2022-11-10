import {CoreOperation, CoreOperationResult, CoreResource, CoreTyped} from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmCreateExternalRoot extends CoreOperation {
  static readonly TYPE = PSM.CREATE_EXTERNAL_ROOT;

  dataPsmTechnicalLabel: string | null = null;

  dataPsmTypes: string[] = [];

  constructor() {
    super();
    this.types.push(DataPsmCreateExternalRoot.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmCreateExternalRoot {
    return resource?.types.includes(DataPsmCreateExternalRoot.TYPE);
  }
}

export class DataPsmCreateExternalRootResult extends CoreOperationResult {
  static readonly TYPE = PSM.CREATE_EXTERNAL_ROOT_RESULT;

  readonly createdDataPsmExternalRoot: string;

  protected constructor(dataPsmExternalRoot: string) {
    super();
    this.types.push(DataPsmCreateExternalRootResult.TYPE);
    this.createdDataPsmExternalRoot = dataPsmExternalRoot;
  }

  static is(resource: CoreTyped | null): resource is DataPsmCreateExternalRootResult {
    return resource?.types.includes(DataPsmCreateExternalRootResult.TYPE);
  }
}
