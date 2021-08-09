import {CoreResource, CoreOperation} from "../../core";

export interface PimUpdateResourceTechnicalLabel extends CoreOperation {

  pimResource?: string;

  pimTechnicalLabel?: string;

}

export const PimUpdateResourceTechnicalLabelType =
  "psm-action-update-technical-label";

export function isDataPimUpdateResourceTechnicalLabel(
  resource: CoreResource,
): resource is PimUpdateResourceTechnicalLabel {
  return resource.types.includes(PimUpdateResourceTechnicalLabelType);
}

export function asPimUpdateResourceTechnicalLabel(
  resource: CoreResource,
): PimUpdateResourceTechnicalLabel {
  if (isDataPimUpdateResourceTechnicalLabel(resource)) {
    return resource as PimUpdateResourceTechnicalLabel;
  }
  resource.types.push(PimUpdateResourceTechnicalLabelType);
  return resource as PimUpdateResourceTechnicalLabel;
}
