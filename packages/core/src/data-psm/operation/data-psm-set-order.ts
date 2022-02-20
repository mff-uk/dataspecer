import { CoreOperation, CoreResource } from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmSetOrder extends CoreOperation {
  static readonly TYPE = PSM.SET_ORDER;

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

  static is(resource: CoreResource | null): resource is DataPsmSetOrder {
    return resource?.types.includes(DataPsmSetOrder.TYPE);
  }
}
