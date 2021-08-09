import {CoreResource} from "../../core";

export interface DataPsmClassReference extends CoreResource {

  /**
   * IRI of class in another schema.
   */
  dataPsmRefersTo?:string;

  /**
   * IRI of the other schema.
   */
  dataPsmSchema?:string;

}

export const DataPsmClassReferenceType = "data-psm-class-reference";

export function isDataPsmClassReference(
  resource: CoreResource,
): resource is DataPsmClassReference {
  return resource.types.includes(DataPsmClassReferenceType);
}

export function asDataPsmClassReference(
  resource: CoreResource,
): DataPsmClassReference {
  if (isDataPsmClassReference(resource)) {
    return resource as DataPsmClassReference;
  }
  resource.types.push(DataPsmClassReferenceType);
  return resource as DataPsmClassReference;
}
