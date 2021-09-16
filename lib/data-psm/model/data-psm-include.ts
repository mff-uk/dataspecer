import {CoreResource} from "../../core";

/**
 * This resource can be used as a part of a class, instead of  a particular
 * attribute or association end. This resource act as a syntactic sugar
 * and perform an include of given attribute list in place of this attribute.
 */
export class DataPsmInclude extends CoreResource {

  private static readonly TYPE = "data-psm-include";

  dataPsmParts: string[] = [];

  constructor(iri:string | null = null) {
    super(iri);
    this.types.push(DataPsmInclude.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmInclude {
    return resource?.types.includes(DataPsmInclude.TYPE);
  }

}
