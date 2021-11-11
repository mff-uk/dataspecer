import {
  CoreOperation,
  CoreOperationResult,
  CoreResource,
  CoreTyped
} from "../../core";

export class DataPsmCreateClassReference extends CoreOperation {

  static readonly TYPE = "data-psm-action-create-class-reference";

  dataPsmNewIri: string | null = null;

  /**
   * IRI of the newly created object.
   */
  dataPsmSpecification: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmCreateClassReference.TYPE);
  }

  static is(
    resource: CoreResource | null
  ): resource is DataPsmCreateClassReference {
    return resource?.types.includes(DataPsmCreateClassReference.TYPE);
  }

}

export class DataPsmCreateClassReferenceResult extends CoreOperationResult {

  private static readonly TYPE = "psm-action-create-class-result";

  readonly createdDataPsmClassReference: string;

  protected constructor(dataPsmClass: string) {
    super();
    this.types.push(DataPsmCreateClassReferenceResult.TYPE);
    this.createdDataPsmClassReference = dataPsmClass;
  }

  static is(
    resource: CoreTyped | null,
  ): resource is DataPsmCreateClassReferenceResult {
    return resource?.types.includes(DataPsmCreateClassReferenceResult.TYPE);
  }

}
