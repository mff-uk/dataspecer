import {CoreAction} from "../core-action";
import {CoreResource, LanguageString} from "../../model";

export class PsmUpdateHumanLabel extends CoreAction {

  static readonly TYPE: string = "psm-action-update-human-label";

  psmResource?: string;

  psmHumanLabel?: LanguageString;

  static is(resource: CoreAction): resource is PsmUpdateHumanLabel {
    return resource.types.includes(PsmUpdateHumanLabel.TYPE);
  }

  static as(resource: CoreResource): PsmUpdateHumanLabel {
    if (PsmUpdateHumanLabel.is(resource)) {
      return resource as PsmUpdateHumanLabel;
    }
    resource.types.push(PsmUpdateHumanLabel.TYPE);
    return resource as PsmUpdateHumanLabel;
  }

}
