import * as PSM from "../data-psm-vocabulary";
import { DataPsmResource } from "./data-psm-resource";

export class DataPsmContainer extends DataPsmResource {
  private static readonly TYPE = PSM.CONTAINER;

  dataPsmParts: string[] = [];

  dataPsmContainerType: string | null = null;

  /**
   * Minimum and maximum cardinality.
   * If the maximum cardinality is null, then the cardinality is unbounded.
   * If the cardinality is null, then the cardinality is unknown or taken from semantic model.
   */
  dataPsmCardinality?: [number, number | null] | null;

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(DataPsmContainer.TYPE);
  }

  static is(resource: any): resource is DataPsmContainer {
    return resource?.types?.includes(DataPsmContainer.TYPE);
  }
}
