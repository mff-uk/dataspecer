import {WebSpecificationConceptualEntity} from "./web-specification-conceptual-entity";

export interface  WebSpecificationConceptualType {

  isComplex(): boolean;

  isPrimitive(): boolean;

}

export class WebSpecificationConceptualPrimitiveType
  implements WebSpecificationConceptualType {

  isComplex(): boolean {
    return false;
  }

  isPrimitive(): boolean {
    return true;
  }

}

export class WebSpecificationConceptualComplexType
  implements WebSpecificationConceptualType {

  entity: WebSpecificationConceptualEntity | null = null;

  isComplex(): boolean {
    return true;
  }

  isPrimitive(): boolean {
    return false;
  }

}
