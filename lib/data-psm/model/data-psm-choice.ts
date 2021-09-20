import {CoreResource} from "../../core";
import {DataPsmResource} from "./data-psm-resource";

/**
 * Represent a choice among multiple classes.
 */
export class DataPsmChoice extends DataPsmResource {

  private static readonly TYPE = "data-psm-choice";

  dataPsmParts: string[] = [];

  constructor(iri:string | null = null) {
    super(iri);
    this.types.push(DataPsmChoice.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmChoice {
    return resource?.types.includes(DataPsmChoice.TYPE);
  }

}
