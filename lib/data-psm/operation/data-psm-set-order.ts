import {CoreOperation, CoreResource} from "../../core";

export class DataPsmSetOrder extends CoreOperation {

  static readonly TYPE = "data-psm-action-set-order";

  dataPsmOwnerClass: string | null = null;

  dataPsmResourceToMove: string | null = null;

  /**
   * Set null to move to the first position.
   */
  dataPsmMoveAfter: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetOrder.TYPE);
  }

  static is(
    resource: CoreResource | null,
  ): resource is DataPsmSetOrder {
    return resource?.types.includes(DataPsmSetOrder.TYPE);
  }

}
