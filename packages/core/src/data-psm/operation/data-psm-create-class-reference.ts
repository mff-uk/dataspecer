import {
  CoreOperation,
  CoreOperationResult,
  CoreResource,
  CoreTyped,
} from "../../core/index.ts";
import * as PSM from "../data-psm-vocabulary.ts";

export class DataPsmCreateClassReference extends CoreOperation {
  static readonly TYPE = PSM.CREATE_CLASS_REFERENCE;

  /**
   * IRI of the newly created object.
   */
  dataPsmNewIri: string | null = null;

  /**
   * IRI of a specification.
   */
  dataPsmSpecification: string | null = null;

  /**
   * IRI of the PSM class.
   */
  dataPsmClass: string | null = null;

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
  static readonly TYPE = PSM.CREATE_CLASS_REFERENCE_RESULT;

  readonly createdDataPsmClassReference: string;

  protected constructor(dataPsmClass: string) {
    super();
    this.types.push(DataPsmCreateClassReferenceResult.TYPE);
    this.createdDataPsmClassReference = dataPsmClass;
  }

  static is(
    resource: CoreTyped | null
  ): resource is DataPsmCreateClassReferenceResult {
    return resource?.types.includes(DataPsmCreateClassReferenceResult.TYPE);
  }
}
