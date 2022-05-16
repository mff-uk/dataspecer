import {CoreResource} from "../../core";
import {ExtendableCoreResource} from "./extendable-core-resource";
import * as PSM from "../data-psm-vocabulary";
/**
 * Represents PSM OR construct that select one entity from the given set of
 * entities. So far, this OR is "specialization or", meaning that we can derive
 * its semantic type as nearest common ancestor of its set of entities. It may
 * be linked to {@link DataPsmAssociationEnd} that requires specialization of
 * the corresponding class type, hence this or may be used.
 */
export class DataPsmOr extends ExtendableCoreResource {
  private static readonly TYPE = PSM.OR;

  /**
   * May contain {@link DataPsmClass}, {@link DataPsmClassReference} or
   * {@link DataPsmOr}
   */
  dataPsmChoices: string[] = [];

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(DataPsmOr.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmOr {
    return resource?.types.includes(DataPsmOr.TYPE);
  }
}
