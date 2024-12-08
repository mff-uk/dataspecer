import { CoreOperationResult, CoreResource, CoreTyped } from "../../core";
import { DataPsmCreate } from "./data-psm-create";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmCreateAssociationEnd extends DataPsmCreate {
  static readonly TYPE = PSM.CREATE_ASSOCIATION_END;

  dataPsmOwner: string | null = null;

  dataPsmPart: string | null = null;

  dataPsmIsReverse: boolean | null = null;

  dataPsmIsDematerialize: boolean | null = null;

  constructor() {
    super();
    this.types.push(DataPsmCreateAssociationEnd.TYPE);
  }

  static is(
    resource: CoreResource | null
  ): resource is DataPsmCreateAssociationEnd {
    return resource?.types.includes(DataPsmCreateAssociationEnd.TYPE);
  }
}

export class DataPsmCreateAssociationEndResult extends CoreOperationResult {
  static readonly TYPE = PSM.CREATE_ASSOCIATION_END_RESULT;

  readonly createdDataPsmAssociationEnd: string;

  protected constructor(dataPsmAssociationEnd: string) {
    super();
    this.types.push(DataPsmCreateAssociationEndResult.TYPE);
    this.createdDataPsmAssociationEnd = dataPsmAssociationEnd;
  }

  static is(
    resource: CoreTyped | null
  ): resource is DataPsmCreateAssociationEndResult {
    return resource?.types.includes(DataPsmCreateAssociationEndResult.TYPE);
  }
}
