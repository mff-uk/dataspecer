import { CoreOperationResult, CoreResource, CoreTyped } from "../../core/index.ts";
import { DataPsmCreate } from "./data-psm-create.ts";
import * as PSM from "../data-psm-vocabulary.ts";

export class DataPsmCreateContainer extends DataPsmCreate {
  static readonly TYPE = PSM.CREATE_CONTAINER;

  dataPsmOwner: string | null = null;

  dataPsmContainerType: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmCreateContainer.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmCreateContainer {
    return resource?.types.includes(DataPsmCreateContainer.TYPE);
  }
}

export class DataPsmCreateContainerResult extends CoreOperationResult {
  static readonly TYPE = PSM.CREATE_CONTAINER_RESULT;

  readonly createdDataPsmContainer: string;

  constructor(dataPsmContainer: string) {
    super();
    this.types.push(DataPsmCreateContainerResult.TYPE);
    this.createdDataPsmContainer = dataPsmContainer;
  }

  static is(
    resource: CoreTyped | null
  ): resource is DataPsmCreateContainerResult {
    return resource?.types.includes(DataPsmCreateContainerResult.TYPE);
  }
}
