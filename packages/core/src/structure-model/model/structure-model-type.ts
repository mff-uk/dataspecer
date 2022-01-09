export interface StructureModelType {

  isAttribute(): this is StructureModelPrimitiveType;

  isAssociation(): this is StructureModelComplexType;

}

export class StructureModelPrimitiveType implements StructureModelType {

  dataType: string | null = null;

  isAttribute(): this is StructureModelPrimitiveType {
    return true;
  }

  isAssociation(): this is StructureModelComplexType {
    return false;
  }

}

export class StructureModelComplexType implements StructureModelType {

  /**
   * We do not store reference to a class to allow for simple
   * serialization.
   */
  psmClassIri: string | null = null;

  isAttribute(): this is StructureModelPrimitiveType {
    return false;
  }

  isAssociation(): this is StructureModelComplexType {
    return true;
  }

}
