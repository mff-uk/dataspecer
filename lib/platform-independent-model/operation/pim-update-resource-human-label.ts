import {CoreResource, CoreOperation, LanguageString} from "../../core";

export interface PimUpdateResourceHumanLabel extends CoreOperation {

  pimResource?: string;

  pimHumanLabel?: LanguageString;

}

export const PimUpdateResourceHumanLabelType =
  "psm-action-update-human-label";

export function isPimUpdateResourceHumanLabel(
  resource: CoreResource,
): resource is PimUpdateResourceHumanLabel {
  return resource.types.includes(PimUpdateResourceHumanLabelType);
}

export function asPimUpdateResourceHumanLabel(
  resource: CoreResource,
): PimUpdateResourceHumanLabel {
  if (isPimUpdateResourceHumanLabel(resource)) {
    return resource as PimUpdateResourceHumanLabel;
  }
  resource.types.push(PimUpdateResourceHumanLabelType);
  return resource as PimUpdateResourceHumanLabel;
}
