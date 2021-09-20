import {CoreOperationResult, CoreResource, CoreTyped} from "../../core";
import {DataPsmCreate} from "./data-psm-create";

export class DataPsmCreateAssociationEnd extends DataPsmCreate {

  static readonly TYPE = "data-psm-action-create-association-end";

  dataPsmOwner: string | null = null;

  dataPsmPart: string | null = null;

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

  private static readonly TYPE =
    "data-psm-action-create-association-end-result";

  readonly createdDataPsmAssociationEnd: string;

  protected constructor(dataPsmAssociationEnd: string) {
    super();
    this.types.push(DataPsmCreateAssociationEndResult.TYPE);
    this.createdDataPsmAssociationEnd = dataPsmAssociationEnd;
  }

  static is(
    resource: CoreTyped | null,
  ): resource is DataPsmCreateAssociationEndResult {
    return resource?.types.includes(DataPsmCreateAssociationEndResult.TYPE);
  }

}
