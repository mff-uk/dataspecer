import {CoreAction} from "../core-action";
import {CoreResource, LanguageString, PimSchema} from "../../model"

export class PimCreateSchema extends CoreAction {

  static readonly TYPE: string = "pim-action-create-schema";

  pimHumanLabel?: LanguageString;

  pimHumanDescription?: LanguageString;

  pimParts: string[] = [];

  static is(resource: CoreAction): resource is PimCreateSchema {
    return resource.types.includes(PimCreateSchema.TYPE);
  }

  static as(resource: CoreResource): PimCreateSchema {
    if (PimCreateSchema.is(resource)) {
      return resource as PimCreateSchema;
    }
    resource.types.push(PimCreateSchema.TYPE);
    const result = resource as PimCreateSchema;
    result.pimParts = result.pimParts || [];
    return result;
  }

}
