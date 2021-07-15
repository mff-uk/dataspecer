import {CoreResource, LanguageString} from "../core-resource";

export class PsmSchema extends CoreResource {

  static readonly TYPE: string = "psm-schema";

  psmHumanLabel?: LanguageString;

  psmHumanDescription?: LanguageString;

  psmTechnicalLabel?: string;

  psmRoots: string[] = [];

  static is(resource: CoreResource): resource is PsmSchema {
    return resource.types.includes(PsmSchema.TYPE);
  }

  static as(resource: CoreResource): PsmSchema {
    if (PsmSchema.is(resource)) {
      return resource as PsmSchema;
    }
    resource.types.push(PsmSchema.TYPE);
    const result = resource as PsmSchema;
    result.psmHumanLabel = result.psmHumanLabel || {};
    result.psmRoots = result.psmRoots || [];
    return result;
  }

}
