import {CoreResource, LanguageString} from "../core-resource";

export class PimSchema extends CoreResource {

  static readonly TYPE: string = "pim-schema";

  pimHumanLabel?: LanguageString;

  pimHumanDescription?: LanguageString;

  pimParts: string[] = [];

  static is(resource: CoreResource): resource is PimSchema {
    return resource.types.includes(PimSchema.TYPE);
  }

  static as(resource: CoreResource): PimSchema {
    if (PimSchema.is(resource)) {
      return resource as PimSchema;
    }
    resource.types.push(PimSchema.TYPE);
    const result = resource as PimSchema;
    result.pimParts = result.pimParts || [];
    return result;
  }

}
