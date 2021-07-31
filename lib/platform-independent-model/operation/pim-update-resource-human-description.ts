import {CoreResource, CoreOperation, LanguageString} from "../../core";

export interface PimUpdateResourceHumanDescription extends CoreOperation {

  pimResource?: string;

  pimHumanDescription?: LanguageString;

}

export const PimUpdateResourceHumanDescriptionType =
  "psm-action-update-human-description";

export function isPimUpdateResourceHumanDescription(
  resource: CoreResource
): resource is PimUpdateResourceHumanDescription {
  return resource.types.includes(PimUpdateResourceHumanDescriptionType);
}

export function asPimUpdateResourceHumanDescription(
  resource: CoreResource
): PimUpdateResourceHumanDescription {
  if (isPimUpdateResourceHumanDescription(resource)) {
    return resource as PimUpdateResourceHumanDescription;
  }
  resource.types.push(PimUpdateResourceHumanDescriptionType);
  return resource as PimUpdateResourceHumanDescription;
}
