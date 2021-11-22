export interface ConceptualModelType {

  isAttribute(): this is ConceptualModelPrimitiveType;

  isAssociation(): this is ConceptualModelComplexType;

}

export class ConceptualModelPrimitiveType implements ConceptualModelType {

  dataType: string | null = null;

  isAttribute(): this is ConceptualModelPrimitiveType {
    return true;
  }

  isAssociation(): this is ConceptualModelComplexType {
    return false;
  }

}

export class ConceptualModelComplexType implements ConceptualModelType {

  /**
   * We do not store reference to a class to allow for simple
   * serialization.
   */
  pimClassIri: string | null = null;

  isAttribute(): this is ConceptualModelPrimitiveType {
    return false;
  }

  isAssociation(): this is ConceptualModelComplexType {
    return true;
  }

}
