import {CoreResource, CoreOperation} from "../../core";

export class DataPsmDeleteAttribute extends CoreOperation {

  static readonly TYPE = "data-psm-action-delete-attribute";

  dataPsmOwner: string | null = null;

  dataPsmAttribute: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmDeleteAttribute.TYPE);
  }

  static is(
    resource: CoreResource | null,
  ): resource is DataPsmDeleteAttribute {
    return resource?.types.includes(DataPsmDeleteAttribute.TYPE);
  }

}
