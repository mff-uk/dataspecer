import {CoreResource, CoreOperation} from "../../core";

export class DataPsmDeleteAssociationEnd extends CoreOperation {

  static readonly TYPE = "psm-action-delete-association-end";

  dataPsmOwner: string | null = null;

  dataPsmAssociationEnd: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmDeleteAssociationEnd.TYPE);
  }

  static is(
    resource: CoreResource | null
  ): resource is DataPsmDeleteAssociationEnd {
    return resource.types.includes(DataPsmDeleteAssociationEnd.TYPE);
  }

}
