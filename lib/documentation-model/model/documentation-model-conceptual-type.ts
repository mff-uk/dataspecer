import {
  DocumentationModelConceptualEntity
} from "./documentation-model-conceptual-entity";

export interface DocumentationModelConceptualType {

  isComplex(): boolean;

  isPrimitive(): boolean;

}

export class WebSpecificationConceptualPrimitiveType
  implements DocumentationModelConceptualType {

  isComplex(): boolean {
    return false;
  }

  isPrimitive(): boolean {
    return true;
  }

}

export class WebSpecificationConceptualComplexType
  implements DocumentationModelConceptualType {

  entity: DocumentationModelConceptualEntity | null = null;

  isComplex(): boolean {
    return true;
  }

  isPrimitive(): boolean {
    return false;
  }

}
