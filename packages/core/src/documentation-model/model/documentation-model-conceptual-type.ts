import {
  DocumentationModelConceptualEntity
} from "./documentation-model-conceptual-entity";

export interface DocumentationModelConceptualType {

  isComplex(): this is DocumentationModelConceptualComplexType;

  isPrimitive(): this is DocumentationModelConceptualPrimitiveType;

}

export class DocumentationModelConceptualPrimitiveType
  implements DocumentationModelConceptualType {

  isComplex(): boolean {
    return false;
  }

  isPrimitive(): boolean {
    return true;
  }

}

export class DocumentationModelConceptualComplexType
  implements DocumentationModelConceptualType {

  entity: DocumentationModelConceptualEntity | null = null;

  isComplex(): boolean {
    return true;
  }

  isPrimitive(): boolean {
    return false;
  }

}
