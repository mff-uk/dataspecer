import { CoreOperation, CoreResource } from "../../core/index.ts";
import { SET_JSON_LD_DEFINED_PREFIXES } from "../data-psm-vocabulary.ts";

export class DataPsmSetJsonLdDefinedPrefixes extends CoreOperation {
  static readonly TYPE = SET_JSON_LD_DEFINED_PREFIXES;

  dataPsmEntity: string | null = null;
  jsonLdDefinedPrefixes: { [prefix: string]: string } | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetJsonLdDefinedPrefixes.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmSetJsonLdDefinedPrefixes {
    return resource?.types.includes(DataPsmSetJsonLdDefinedPrefixes.TYPE);
  }
}
