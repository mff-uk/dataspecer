import { CoreOperation, CoreResource } from "../../core";
import { SET_JSON_LD_TYPE_MAPPING } from "../data-psm-vocabulary";

export class DataPsmSetJsonLdDefinedTypeMapping extends CoreOperation {
  static readonly TYPE = SET_JSON_LD_TYPE_MAPPING;

  dataPsmEntity: string | null = null;
  jsonLdDefinedTypeMapping: { [prefix: string]: string } | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetJsonLdDefinedTypeMapping.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmSetJsonLdDefinedTypeMapping {
    return resource?.types.includes(DataPsmSetJsonLdDefinedTypeMapping.TYPE);
  }
}
