import {CoreResource} from "../core-resource";
import {PsmResource} from "./psm-resource";

export class PsmAttribute extends PsmResource {

  static readonly TYPE: string = "psm-attribute";

  psmDatatype?: string;

  static is(resource: CoreResource): resource is PsmAttribute {
    return resource.types.includes(PsmAttribute.TYPE);
  }

  static as(resource: CoreResource): PsmAttribute {
    if (PsmAttribute.is(resource)) {
      return resource as PsmAttribute;
    }
    resource.types.push(PsmAttribute.TYPE);
    return resource as PsmAttribute;
  }

}
