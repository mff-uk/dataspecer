import {CoreResource, CoreOperation, LanguageString} from "../../core";

export interface DataPsmUpdateResourceHumanDescription extends CoreOperation {

  dataPsmResource?: string;

  dataPsmHumanDescription?: LanguageString;

}

export const DataPsmUpdateResourceHumanDescriptionType =
  "psm-action-update-human-description";

export function isDataPsmUpdateResourceHumanDescription(
  resource: CoreResource,
): resource is DataPsmUpdateResourceHumanDescription {
  return resource.types.includes(DataPsmUpdateResourceHumanDescriptionType);
}

export function asDataPsmUpdateResourceHumanDescription(
  resource: CoreResource,
): DataPsmUpdateResourceHumanDescription {
  if (isDataPsmUpdateResourceHumanDescription(resource)) {
    return resource as DataPsmUpdateResourceHumanDescription;
  }
  resource.types.push(DataPsmUpdateResourceHumanDescriptionType);
  return resource as DataPsmUpdateResourceHumanDescription;
}
