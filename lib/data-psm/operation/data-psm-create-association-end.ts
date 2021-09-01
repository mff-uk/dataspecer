import { CoreResource, CoreTyped} from "../../core";
import {DataPsmCreate} from "./data-psm-create";

export interface DataPsmCreateAssociationEnd extends DataPsmCreate {

  dataPsmOwner?: string;

  dataPsmPart?: string;

}

export const DataPsmCreateAssociationEndType =
  "data-psm-action-create-association-end";

export function isDataPsmCreateAssociationEnd(
  resource: CoreResource,
): resource is DataPsmCreateAssociationEnd {
  return resource.types.includes(DataPsmCreateAssociationEndType);
}

export function asDataPsmCreateAssociationEnd(
  resource: CoreResource,
): DataPsmCreateAssociationEnd {
  if (isDataPsmCreateAssociationEnd(resource)) {
    return resource as DataPsmCreateAssociationEnd;
  }
  resource.types.push(DataPsmCreateAssociationEndType);
  return resource as DataPsmCreateAssociationEnd;
}

export interface DataPsmCreateAssociationEndResult extends CoreTyped {

  createdDataPsmAssociationEnd: string;

}

export const DataPsmCreateAssociationEndResultType =
  "data-psm-action-create-association-end-result";

export function isDataPsmCreateAssociationEndResult(
  resource: CoreTyped,
): resource is DataPsmCreateAssociationEndResult {
  return resource.types.includes(DataPsmCreateAssociationEndResultType);
}

export function createDataPsmCreateAssociationEndResultProperties(
  createdDataPsmAssociationEnd: string,
): DataPsmCreateAssociationEndResult {
  return {
    "types": [DataPsmCreateAssociationEndResultType],
    "createdDataPsmAssociationEnd": createdDataPsmAssociationEnd,
  };
}
