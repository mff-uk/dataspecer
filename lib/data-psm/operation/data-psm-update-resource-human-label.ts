import {CoreResource, CoreOperation, LanguageString} from "../../core";

export interface DataPsmUpdateResourceHumanLabel extends CoreOperation {

  psmResource?: string;

  psmHumanLabel?: LanguageString;

}

export const DataPsmUpdateResourceHumanLabelType =
  "psm-action-update-human-label";

export function isDataPsmUpdateResourceHumanLabel(
  resource: CoreResource
): resource is DataPsmUpdateResourceHumanLabel {
  return resource.types.includes(DataPsmUpdateResourceHumanLabelType);
}

export function asDataPsmUpdateResourceHumanLabel(
  resource: CoreResource
): DataPsmUpdateResourceHumanLabel {
  if (isDataPsmUpdateResourceHumanLabel(resource)) {
    return resource as DataPsmUpdateResourceHumanLabel;
  }
  resource.types.push(DataPsmUpdateResourceHumanLabelType);
  return resource as DataPsmUpdateResourceHumanLabel;
}
