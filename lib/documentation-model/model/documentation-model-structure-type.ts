import {
  DocumentationModelStructureEntity,
} from "./documentation-model-structure-entity";

export interface DocumentationModelStructureType {

  isComplex(): this is WebSpecificationStructureComplexType;

  isPrimitive(): this is WebSpecificationStructurePrimitiveType;

}

export class WebSpecificationStructurePrimitiveType
  implements DocumentationModelStructureType {

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
  implements DocumentationModelStructureType {

  entity: DocumentationModelStructureEntity | null = null;

  isComplex(): this is WebSpecificationStructureComplexType {
    return true;
  }

  isPrimitive(): this is WebSpecificationStructurePrimitiveType {
    return false;
  }

}