import { CoreOperation, CoreResource } from "../../core/index.ts";
import * as PSM from "../data-psm-vocabulary.ts";

export class DataPsmSetJsonSchemaPrefixesInIriRegex extends CoreOperation {
  static readonly TYPE = PSM.SET_JSON_SCHEMA_PREFIXES_IN_IRI_REGEX;

  dataPsmResource: string | null = null;

  jsonSchemaPrefixesInIriRegex: {
    usePrefixes: "ALWAYS" | "NEVER" | "OPTIONAL";
    includeParentPrefixes: boolean;
  } | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetJsonSchemaPrefixesInIriRegex.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmSetJsonSchemaPrefixesInIriRegex {
    return resource?.types.includes(DataPsmSetJsonSchemaPrefixesInIriRegex.TYPE);
  }
}
