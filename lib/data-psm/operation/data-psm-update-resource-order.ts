import {CoreResource, CoreOperation} from "../../core";

export interface DataPsmUpdateResourceOrder extends CoreOperation {

  psmResource: string;

  psmMoveAfter: string;

}

export const DataPsmUpdateResourceOrderType = "psm-action-update-order";

export function isDataPsmUpdateResourceOrder(
  resource: CoreResource
): resource is DataPsmUpdateResourceOrder {
  return resource.types.includes(DataPsmUpdateResourceOrderType);
}

export function asDataPsmUpdateResourceOrder(
  resource: CoreResource
): DataPsmUpdateResourceOrder {
  if (isDataPsmUpdateResourceOrder(resource)) {
    return resource as DataPsmUpdateResourceOrder;
  }
  resource.types.push(DataPsmUpdateResourceOrderType);
  return resource as DataPsmUpdateResourceOrder;
}
