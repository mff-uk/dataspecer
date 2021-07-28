import {CoreResource, CoreOperation, LanguageString} from "../../core";

export interface PsmUpdateHumanLabel extends CoreOperation {

  psmResource?: string;

  psmHumanDescription?: LanguageString;

}

export const PsmUpdateHumanLabelType = "psm-action-update-human-description";

export function isPsmUpdateHumanLabel(
  resource: CoreResource
): resource is PsmUpdateHumanLabel {
  return resource.types.includes(PsmUpdateHumanLabelType);
}

export function asPsmUpdateHumanLabel(
  resource: CoreResource
): PsmUpdateHumanLabel {
  if (isPsmUpdateHumanLabel(resource)) {
    return resource as PsmUpdateHumanLabel;
  }
  resource.types.push(PsmUpdateHumanLabelType);
  return resource as PsmUpdateHumanLabel;
}
