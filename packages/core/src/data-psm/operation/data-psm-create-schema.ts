import {
  CoreOperation,
  CoreOperationResult,
  CoreResource,
  CoreTyped,
  LanguageString,
} from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmCreateSchema extends CoreOperation {
  static readonly TYPE = PSM.CREATE_SCHEMA;

  /**
   * IRI of the newly created object.
   */
  dataPsmNewIri: string | null = null;

  dataPsmHumanLabel: LanguageString | null = null;

  dataPsmHumanDescription: LanguageString | null = null;

  constructor() {
    super();
    this.types.push(DataPsmCreateSchema.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmCreateSchema {
    return resource?.types.includes(DataPsmCreateSchema.TYPE);
  }
}

export class DataPsmCreateSchemaResult extends CoreOperationResult {
  static readonly TYPE = PSM.CREATE_SCHEMA_RESULT;

  readonly createdDataPsmSchema: string;

  constructor(dataPsmSchema: string) {
    super();
    this.types.push(DataPsmCreateSchemaResult.TYPE);
    this.createdDataPsmSchema = dataPsmSchema;
  }

  static is(resource: CoreTyped | null): resource is DataPsmCreateSchemaResult {
    return resource?.types.includes(DataPsmCreateSchemaResult.TYPE);
  }
}
