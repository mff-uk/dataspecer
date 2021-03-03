
export enum PropertyType {
  /**
   * Complex type.
   */
  Attribute,
  /**
   * Primitive type, such as string or integer.
   */
  Association
}

/**
 * Holds information used to generate a single item in the output context.
 */
export class PropertyData {

  /**
   * List of IRIs used to build this object, from PSM, PIM to CIM.
   */
  iris: string[];

  psmIri: string;

  cimIri: string | undefined;

  technicalLabel: string | undefined;

  humanLabel: Record<string, string> | undefined;

  humanDescription: Record<string, string> | undefined;

  propertyType: PropertyType;

  dataTypePrimitive: string | undefined;

  dataTypeClass: ClassData[] = [];

}

export class ClassData {

  /**
   * List of IRIs used to build this object, from PSM, PIM to CIM.
   */
  iris: string[];

  psmIri: string;

  cimIri: string | undefined;

  technicalLabel: string | undefined;

  humanLabel: Record<string, string> | undefined;

  humanDescription: Record<string, string> | undefined;

  extends: ClassData [] = [];

  properties: PropertyData[] = [];

  schema: SchemaData | undefined;

  isCodelist: boolean = false;

}

export class SchemaData {

  psmIri: string;

  humanLabel: Record<string, string> | undefined;

  humanDescription: Record<string, string> | undefined;

  roots: ClassData[] = [];

}
