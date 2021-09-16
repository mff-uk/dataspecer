import {CoreResource} from "../../core";

/**
 * Allow us to reference a class in another schema.
 */
export class DataPsmClassReference extends CoreResource {

  private static readonly TYPE = "data-psm-class-reference";

  /**
   * IRI of class in another schema.
   */
  dataPsmRefersTo: string | null = null;

  /**
   * IRI of the other schema.
   */
  dataPsmSchema: string | null = null;

  constructor(iri:string | null = null) {
    super(iri);
    this.types.push(DataPsmClassReference.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmClassReference {
    return resource?.types.includes(DataPsmClassReference.TYPE);
  }

}
