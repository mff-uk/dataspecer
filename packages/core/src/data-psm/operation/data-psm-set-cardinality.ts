import { CoreOperation, CoreResource } from "../../core/index.ts";
import * as PSM from "../data-psm-vocabulary.ts";

export class DataPsmSetCardinality extends CoreOperation {
  static readonly TYPE = PSM.SET_CARDINALITY;

  entityId: string | null = null;

  dataPsmCardinality: [number, number | null] | null;

  constructor() {
    super();
    this.types.push(DataPsmSetCardinality.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmSetCardinality {
    return resource?.types.includes(DataPsmSetCardinality.TYPE);
  }
}
