import * as PSM from "../data-psm-vocabulary";
import { DataPsmResource } from "./data-psm-resource";

export class DataPsmContainer extends DataPsmResource {
  private static readonly TYPE = PSM.CONTAINER;

  dataPsmParts: string[] = [];

  dataPsmContainerType: string | null = null;

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(DataPsmContainer.TYPE);
  }

  static is(resource: any): resource is DataPsmContainer {
    return resource?.types?.includes(DataPsmContainer.TYPE);
  }
}
