import {CoreResource} from "../../core";
import {PimResource} from "./pim-resource";

/**
 * An attribute is a primitive property that belongs to a class. It may be
 * a string, integer etc.
 */
export class PimAttribute extends PimResource {

  private static readonly TYPE = "pim-attribute";

  pimDatatype: string | null = null;

  pimOwnerClass: string | null = null;

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(PimAttribute.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimAttribute {
    return resource?.types.includes(PimAttribute.TYPE);
  }

}
