import { CoreResource, CoreOperation } from "../../core/index.ts";
import * as PSM from "../data-psm-vocabulary.ts";

export class DataPsmDeleteAttribute extends CoreOperation {
  static readonly TYPE = PSM.DELETE_ATTRIBUTE;

  dataPsmOwner: string | null = null;

  dataPsmAttribute: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmDeleteAttribute.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmDeleteAttribute {
    return resource?.types.includes(DataPsmDeleteAttribute.TYPE);
  }
}
