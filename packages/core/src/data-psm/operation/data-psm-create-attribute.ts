import { CoreOperationResult, CoreResource, CoreTyped } from "../../core";
import { DataPsmCreate } from "./data-psm-create";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmCreateAttribute extends DataPsmCreate {
  static readonly TYPE = PSM.CREATE_ATTRIBUTE;

  dataPsmOwner: string | null = null;

  dataPsmDatatype: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmCreateAttribute.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmCreateAttribute {
    return resource?.types.includes(DataPsmCreateAttribute.TYPE);
  }
}

export class DataPsmCreateAttributeResult extends CoreOperationResult {
  static readonly TYPE = PSM.CREATE_ATTRIBUTE_RESULT;

  readonly createdDataPsmAttribute: string;

  constructor(dataPsmAttribute: string) {
    super();
    this.types.push(DataPsmCreateAttributeResult.TYPE);
    this.createdDataPsmAttribute = dataPsmAttribute;
  }

  static is(
    resource: CoreTyped | null
  ): resource is DataPsmCreateAttributeResult {
    return resource?.types.includes(DataPsmCreateAttributeResult.TYPE);
  }
}
