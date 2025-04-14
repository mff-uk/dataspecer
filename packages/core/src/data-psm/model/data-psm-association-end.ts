import { DataPsmResource } from "./data-psm-resource.ts";
import * as PSM from "../data-psm-vocabulary.ts";

/**
 * On the PSM level the complex properties are represented as association
 * ends. An association end can point to a class and any other resource
 * that can be resolved into one or more classes.
 */
export class DataPsmAssociationEnd extends DataPsmResource {
  private static readonly TYPE = PSM.ASSOCIATION_END;

  /**
   * This is semantic model relationship.
   */
  dataPsmPart: string | null = null;

  /**
   * If true, the end points to index zero in ends.
   */
  dataPsmIsReverse: boolean | null = null;

  /**
   * If true, the content of this association end should be imported
   * to the owner class instead of the association end class to be
   * materialized in the output.
   */
  dataPsmIsDematerialize: boolean | null = null;

  /**
   * Minimum and maximum cardinality.
   * If the maximum cardinality is null, then the cardinality is unbounded.
   * If the cardinality is null, then the cardinality is unknown or taken from semantic model.
   */
  dataPsmCardinality?: [number, number | null] | null;

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(DataPsmAssociationEnd.TYPE);
  }

  static is(resource: any): resource is DataPsmAssociationEnd {
    return resource?.types?.includes(DataPsmAssociationEnd.TYPE);
  }
}
