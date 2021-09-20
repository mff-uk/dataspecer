import {CoreResource} from "../../core";
import {PimResource} from "./pim-resource";

/**
 * Represents a class. On the PIM level the properties are not pointed to
 * from the class. Instead the properties specify an owner class and the
 * associations ends points to classes.
 */
export class PimClass extends PimResource {

  private static readonly TYPE = "pim-class";

  pimExtends: string[] = [];

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(PimClass.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimClass {
    return resource?.types.includes(PimClass.TYPE);
  }

}
