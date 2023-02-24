import {StructureModelClass} from "./structure-model-class";

export interface StructureModelType {
  isAttribute(): this is StructureModelPrimitiveType;

  isAssociation(): this is StructureModelComplexType;
}

export class StructureModelPrimitiveType implements StructureModelType {
  dataType: string | null = null;

  regex: string | null = null;

  /**
   * Set of examples of values of this property.
   */
  example: unknown[] | null = null;

  isAttribute(): this is StructureModelPrimitiveType {
    return true;
  }

  isAssociation(): this is StructureModelComplexType {
    return false;
  }
}

export class StructureModelComplexType implements StructureModelType {
  dataType: StructureModelClass = null;

  isAttribute(): this is StructureModelPrimitiveType {
    return false;
  }

  isAssociation(): this is StructureModelComplexType {
    return true;
  }
}
