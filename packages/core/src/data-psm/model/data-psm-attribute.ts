import { DataPsmResource } from "./data-psm-resource";
import * as PSM from "../data-psm-vocabulary";

/**
 * An attribute is a primitive property. It may be a string, integer etc.
 */
export class DataPsmAttribute extends DataPsmResource {
  private static readonly TYPE = PSM.ATTRIBUTE;

  dataPsmDatatype: string | null = null;

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(DataPsmAttribute.TYPE);
  }

  static is(resource: any): resource is DataPsmAttribute {
    return resource?.types?.includes(DataPsmAttribute.TYPE);
  }
}
