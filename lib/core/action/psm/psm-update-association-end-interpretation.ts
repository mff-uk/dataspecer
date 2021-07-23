import {CoreAction} from "../core-action";
import {CoreResource} from "../../model";

export class PsmUpdateAssociationEndInterpretation extends CoreAction {

  static readonly TYPE: string =
    "psm-action-update-association-end-interpretation";

  psmAssociationEnd?: string;

  psmInterpretation?: string;

  static is(
    resource: CoreAction
  ): resource is PsmUpdateAssociationEndInterpretation {
    return resource.types.includes(PsmUpdateAssociationEndInterpretation.TYPE);
  }

  static as(resource: CoreResource): PsmUpdateAssociationEndInterpretation {
    if (PsmUpdateAssociationEndInterpretation.is(resource)) {
      return resource as PsmUpdateAssociationEndInterpretation;
    }
    resource.types.push(PsmUpdateAssociationEndInterpretation.TYPE);
    return resource as PsmUpdateAssociationEndInterpretation;
  }

}
