import {CoreResource} from "../../core";
import {PimResource} from "./pim-resource";
import * as PIM from "../pim-vocabulary";

/**
 * Represents a class. On the PIM level the properties are not pointed to
 * from the class. Instead the properties specify an owner class and the
 * associations ends points to classes.
 */
export class PimClass extends PimResource {

  private static readonly TYPE = PIM.CLASS;

  pimExtends: string[] = [];

  pimIsCodelist: boolean = false;

  pimCodelistUrl: string[] = [];

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(PimClass.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimClass {
    return resource?.types.includes(PimClass.TYPE);
  }

}
