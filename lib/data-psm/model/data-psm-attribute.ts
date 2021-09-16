import {CoreResource} from "../../core";
import {DataPsmResource} from "./data-psm-resource";

/**
 * An attribute is a primitive property. It may be a string, integer etc.
 */
export class DataPsmAttribute extends DataPsmResource {

  private static readonly TYPE = "data-psm-attribute";

  dataPsmDatatype: string | null = null;

  constructor(iri:string | null = null) {
    super(iri);
    this.types.push(DataPsmAttribute.TYPE);
  }

  static is(resource: CoreResource | null) : resource is DataPsmAttribute {
    return resource?.types.includes(DataPsmAttribute.TYPE);
  }

}
