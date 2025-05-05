import {ExtendableCoreResource} from "./extendable-core-resource.ts";
import * as PSM from "../data-psm-vocabulary.ts";

/**
 * Allow us to reference a class in another schema.
 */
export class DataPsmClassReference extends ExtendableCoreResource {
  private static readonly TYPE = PSM.CLASS_REFERENCE;

  /**
   * IRI of class owner data-PSM model.
   * TODO Rename to 'dataPsmModel' once we are ready for data migration!
   */
  dataPsmSpecification: string | null = null;

  dataPsmClass: string | null = null;

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(DataPsmClassReference.TYPE);
  }

  static is(resource: any): resource is DataPsmClassReference {
    return resource?.types?.includes(DataPsmClassReference.TYPE);
  }
}
