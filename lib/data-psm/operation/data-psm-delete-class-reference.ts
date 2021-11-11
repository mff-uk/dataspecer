import {CoreResource, CoreOperation} from "../../core";

export class DataPsmDeleteClassReference extends CoreOperation {

  static readonly TYPE = "data-psm-action-delete-class-reference";

  dataPsmClassReference: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmDeleteClassReference.TYPE);
  }

  static is(
    resource: CoreResource | null
  ): resource is DataPsmDeleteClassReference {
    return resource?.types.includes(DataPsmDeleteClassReference.TYPE);
  }

}
