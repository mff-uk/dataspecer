import {
  DocumentationModelStructureEntity,
} from "./documentation-model-structure-entity";

export interface DocumentationModelStructureType {

  cardinalityMin: number | null;

  cardinalityMax: number | null;

  isComplex(): this is DocumentationModelStructureComplexType;

  isPrimitive(): this is DocumentationModelStructurePrimitiveType;

}

export class DocumentationModelStructurePrimitiveType
  implements DocumentationModelStructureType {

  cardinalityMin: number | null = null;

  cardinalityMax: number | null = null;

  humanLabel: string | null = null;

  /**
   * IRI of the primitive type.
   */
  typeIri: string | null = null;

  isComplex(): this is DocumentationModelStructureComplexType {
    return false;
  }

  isPrimitive(): this is DocumentationModelStructurePrimitiveType {
    return true;
  }

}

export class DocumentationModelStructureComplexType
  implements DocumentationModelStructureType {

  cardinalityMin: number | null = null;

  cardinalityMax: number | null = null;

  entity: DocumentationModelStructureEntity | null = null;

  isComplex(): this is DocumentationModelStructureComplexType {
    return true;
  }

  isPrimitive(): this is DocumentationModelStructurePrimitiveType {
    return false;
  }

}