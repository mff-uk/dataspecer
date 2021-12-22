import {CoreResource} from "../../core";
import {PimResource} from "./pim-resource";
import * as PIM from "../pim-vocabulary";

/**
 * Specify one end of the association that points to a data type definition,
 * most likely a class.
 */
export class PimAssociationEnd extends PimResource {

  private static readonly TYPE = PIM.ASSOCIATION_END;

  pimPart: string | null = null;

  pimCardinalityMin: number | null = null;

  pimCardinalityMax: number | null = null;

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(PimAssociationEnd.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimAssociationEnd {
    return resource?.types.includes(PimAssociationEnd.TYPE);
  }

}
