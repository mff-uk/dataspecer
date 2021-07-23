import {CoreAction} from "../core-action";
import {CoreResource} from "../../model";

export class PsmUpdateAttributeInterpretation extends CoreAction {

  static readonly TYPE: string = "psm-action-update-attribute-interpretation";

  psmAttribute?: string;

  psmInterpretation?: string;

  static is(
    resource: CoreAction
  ): resource is PsmUpdateAttributeInterpretation {
    return resource.types.includes(PsmUpdateAttributeInterpretation.TYPE);
  }

  static as(resource: CoreResource): PsmUpdateAttributeInterpretation {
    if (PsmUpdateAttributeInterpretation.is(resource)) {
      return resource as PsmUpdateAttributeInterpretation;
    }
    resource.types.push(PsmUpdateAttributeInterpretation.TYPE);
    return resource as PsmUpdateAttributeInterpretation;
  }

}
