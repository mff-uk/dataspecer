import {CoreResource} from "../../core";
import {DataPsmResource} from "./data-psm-resource";
import * as PSM from "../data-psm-vocabulary";

/**
 * On the PSM level the complex properties are represented as association
 * ends. An association end can point to a class and any other resource
 * that can be resolved into one or more classes.
 */
export class DataPsmAssociationEnd extends DataPsmResource {

  private static readonly TYPE = PSM.ASSOCIATION_END;

  dataPsmPart: string | null = null;

  constructor(iri:string | null = null) {
    super(iri);
    this.types.push(DataPsmAssociationEnd.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmAssociationEnd {
    return resource?.types.includes(DataPsmAssociationEnd.TYPE);
  }

}
