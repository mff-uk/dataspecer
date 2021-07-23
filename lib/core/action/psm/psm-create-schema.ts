import {PimCreate} from "./psm-create";
import {CoreAction} from "../core-action";
import {CoreResource} from "../../model";

export class PsmCreateSchema extends PimCreate {

  static readonly TYPE: string = "psm-action-create-schema";

  psmRoots: string[] = [];

  static is(resource: CoreAction): resource is PsmCreateSchema {
    return resource.types.includes(PsmCreateSchema.TYPE);
  }

  static as(resource: CoreResource): PsmCreateSchema {
    if (PsmCreateSchema.is(resource)) {
      return resource as PsmCreateSchema;
    }
    resource.types.push(PsmCreateSchema.TYPE);
    const result = resource as PsmCreateSchema;
    result.psmRoots = result.psmRoots || [];
    return result;
  }

}
