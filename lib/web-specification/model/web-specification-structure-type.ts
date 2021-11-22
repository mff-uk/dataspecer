import {
  WebSpecificationStructureEntity,
} from "./web-specification-structure-entity";

export interface  WebSpecificationStructureType {

  isComplex(): this is WebSpecificationStructureComplexType;

  isPrimitive(): this is WebSpecificationStructurePrimitiveType;

}

export class WebSpecificationStructurePrimitiveType
  implements WebSpecificationStructureType {

  humanLabel: string | null = null;

  /**
   * IRI of the primitive type.
   */
  typeIri: string | null = null;

  isComplex(): this is WebSpecificationStructureComplexType {
    return false;
  }

  isPrimitive(): this is WebSpecificationStructurePrimitiveType {
    return true;
  }

}

export class WebSpecificationStructureComplexType
  implements WebSpecificationStructureType {

  entity: WebSpecificationStructureEntity | null = null;

  isComplex(): this is WebSpecificationStructureComplexType {
    return true;
  }

  isPrimitive(): this is WebSpecificationStructurePrimitiveType {
    return false;
  }

}