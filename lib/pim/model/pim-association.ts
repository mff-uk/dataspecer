import {CoreResource} from "../../core";
import {PimResource} from "./pim-resource";
import * as PIM from "../pim-vocabulary";

/**
 * An association connects two entities, but it does not point to entities
 * directly instead it points to association ends that points to the entities.
 *
 * As association connect two entities without any side preference, i.e. there
 * is no order on the ends, the association does not belong to any class.
 */
export class PimAssociation extends PimResource {

  private static readonly TYPE = PIM.ASSOCIATION;

  pimEnd: string[];

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(PimAssociation.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimAssociation {
    return resource?.types.includes(PimAssociation.TYPE);
  }

}
