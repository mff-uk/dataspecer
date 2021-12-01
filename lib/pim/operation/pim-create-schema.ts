import {
  CoreOperation, CoreOperationResult,
  CoreResource, CoreTyped,
  LanguageString,
} from "../../core";
import * as PIM from "../pim-vocabulary";

export class PimCreateSchema extends CoreOperation {

  static readonly TYPE = PIM.CREATE_SCHEMA;

  /**
   * IRI of the newly created object.
   */
  pimNewIri: string | null = null;

  pimHumanLabel: LanguageString | null = null;

  pimHumanDescription: LanguageString | null = null;

  constructor() {
    super();
    this.types.push(PimCreateSchema.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimCreateSchema {
    return resource?.types.includes(PimCreateSchema.TYPE);
  }

}

export class PimCreateSchemaResult extends CoreOperationResult {

  static readonly TYPE = PIM.CREATE_SCHEMA_RESULT;

  createdPimSchema: string;

  constructor(createdPimSchema: string) {
    super();
    this.types.push(PimCreateSchemaResult.TYPE);
    this.createdPimSchema = createdPimSchema;
  }

  static is(
    resource: CoreTyped | null,
  ): resource is PimCreateSchemaResult {
    return resource?.types.includes(PimCreateSchemaResult.TYPE);
  }

}
