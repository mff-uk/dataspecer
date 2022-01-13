import {
  DocumentationModelConceptualEntity
} from "./documentation-model-conceptual-entity";

export interface DocumentationModelConceptualType {

  cardinalityMin: number | null;

  cardinalityMax: number | null;

  isComplex(): boolean;

  isPrimitive(): boolean;

}

export class DocumentationModelConceptualPrimitiveType
  implements DocumentationModelConceptualType {

  cardinalityMin: number | null = null;

  cardinalityMax: number | null = null;

  isComplex(): boolean {
    return false;
  }

  isPrimitive(): boolean {
    return true;
  }

}

export class DocumentationModelConceptualComplexType
  implements DocumentationModelConceptualType {

  cardinalityMin: number | null = null;

  cardinalityMax: number | null = null;

  entity: DocumentationModelConceptualEntity | null = null;

  isComplex(): boolean {
    return true;
  }

  isPrimitive(): boolean {
    return false;
  }

}
