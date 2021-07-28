import {CoreResource, CoreOperation} from "../../core";

export interface DataPsmUpdateResourceTechnicalLabel extends CoreOperation {

  psmResource?: string;

  psmTechnicalLabel?: string;

}

export const DataPsmUpdateResourceTechnicalLabelType =
  "psm-action-update-technical-label";

export function isDataPsmUpdateResourceTechnicalLabel(
  resource: CoreResource
): resource is DataPsmUpdateResourceTechnicalLabel {
  return resource.types.includes(DataPsmUpdateResourceTechnicalLabelType);
}

export function asDataPsmUpdateResourceTechnicalLabel(
  resource: CoreResource
): DataPsmUpdateResourceTechnicalLabel {
  if (isDataPsmUpdateResourceTechnicalLabel(resource)) {
    return resource as DataPsmUpdateResourceTechnicalLabel;
  }
  resource.types.push(DataPsmUpdateResourceTechnicalLabelType);
  return resource as DataPsmUpdateResourceTechnicalLabel;
}
