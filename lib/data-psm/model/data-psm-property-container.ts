import {CoreResource} from "../../core";

/**
 * Represent a container with properties.
 */
export class DataPsmPropertyContainer extends CoreResource {

  private static readonly TYPE = "data-psm-container";
  
  dataPsmParts: string[] = [];

  constructor(iri:string | null = null) {
    super(iri);
    this.types.push(DataPsmPropertyContainer.TYPE);
  }

  static is(
    resource: CoreResource | null
  ): resource is DataPsmPropertyContainer {
    return resource?.types.includes(DataPsmPropertyContainer.TYPE);
  }

}
