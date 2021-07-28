import {CoreResource, CoreOperation} from "../../core";

export interface DataPsmUpdateResourceInterpretation extends CoreOperation {

  psmAssociationEnd?: string;

  psmInterpretation?: string;

}

export const DataPsmUpdateResourceInterpretationType =
  "psm-action-update-association-end-interpretation";

export function isDataPsmUpdateResourceInterpretation(
  resource: CoreResource
): resource is DataPsmUpdateResourceInterpretation {
  return resource.types.includes(DataPsmUpdateResourceInterpretationType);
}

export function asDataPsmUpdateResourceInterpretation(
  resource: CoreResource
): DataPsmUpdateResourceInterpretation {
  if (isDataPsmUpdateResourceInterpretation(resource)) {
    return resource as DataPsmUpdateResourceInterpretation;
  }
  resource.types.push(DataPsmUpdateResourceInterpretationType);
  return resource as DataPsmUpdateResourceInterpretation;
}
