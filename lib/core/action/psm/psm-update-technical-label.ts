import {CoreAction} from "../core-action";
import {CoreResource} from "../../model";

export class PsmUpdateTechnicalLabel extends CoreAction {

  static readonly TYPE: string = "psm-action-update-technical-label";

  psmResource?: string;

  psmTechnicalLabel?: string;

  static is(resource: CoreAction): resource is PsmUpdateTechnicalLabel {
    return resource.types.includes(PsmUpdateTechnicalLabel.TYPE);
  }

  static as(resource: CoreResource): PsmUpdateTechnicalLabel {
    if (PsmUpdateTechnicalLabel.is(resource)) {
      return resource as PsmUpdateTechnicalLabel;
    }
    resource.types.push(PsmUpdateTechnicalLabel.TYPE);
    return resource as PsmUpdateTechnicalLabel;
  }

}
