import {CoreAction} from "../core-action";
import {CoreResource} from "../../model";

export class PsmUpdateClassInterpretation extends CoreAction {

  static readonly TYPE: string = "psm-action-update-class-interpretation";

  psmClass?: string;

  psmInterpretation?: string;

  static is(resource: CoreAction): resource is PsmUpdateClassInterpretation {
    return resource.types.includes(PsmUpdateClassInterpretation.TYPE);
  }

  static as(resource: CoreResource): PsmUpdateClassInterpretation {
    if (PsmUpdateClassInterpretation.is(resource)) {
      return resource as PsmUpdateClassInterpretation;
    }
    resource.types.push(PsmUpdateClassInterpretation.TYPE);
    return resource as PsmUpdateClassInterpretation;
  }

}
