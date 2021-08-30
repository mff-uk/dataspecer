export type LanguageString = { [language: string]: string };

/**
 * Schema is the root object that is used to identify a collection of classes.
 * We can see schema as a diagram that contains the class definitions.
 */
export interface ObjectModelSchema {

  /**
   * IRI of parent entity in the data-psm level.
   */
  psmIri?: string;

  /**
   * Label used by a computer, can be used as for example as a name of
   * a property in JSON.
   */
  technicalLabel?: string;

  /**
   * Label visible to a human reader.
   */
  humanLabel?: LanguageString;

  /**
   * Description visible to a human reader.
   */
  humanDescription?: LanguageString;

  /**
   * Root classes as specified by the data-psm schema.
   */
  roots: ObjectModelClass[];

  /**
   * All classes in the schema including the root classes.
   */
  classes: ObjectModelClass[];

}

export function createObjectModelSchema(): ObjectModelSchema {
  return {
    "roots": [],
    "classes": [],
  };
}

/**
 * Base class for each entity, even for schema, in the object model.
 */
export interface ObjectModelResource {

  /**
   * The cim level is optional as the pim level may not have an interpretation.
   */
  cimIri?: string;

  /**
   * The pim level is optional is data-psm level may not have an interpretation.
   */
  pimIri?: string;

  /**
   * IRI of parent entity in the data-psm level.
   */
  psmIri?: string;

  /**
   * Label used by a computer, can be used as for example as a name of
   * a property in JSON.
   */
  technicalLabel?: string;

  /**
   * Label visible to a human reader.
   */
  humanLabel?: LanguageString;

  /**
   * Description visible to a human reader.
   */
  humanDescription?: LanguageString;

}

export interface ObjectModelClass extends ObjectModelResource {

  /**
   * Used for type checking.
   */
  type: string;

  /**
   * Class can extend other classes, the properties of other classes
   * are not included in this class.
   */
  extends: ObjectModelClass [];

  /**
   * Properties declared on this class directly. The list is ordered.
   */
  properties: ObjectModelProperty[];

  /**
   * If set to true values of this class are available in a codelist.
   */
  isCodelist: boolean;

}

const ObjectModelClassType = "object-model-class";

export function isObjectModelClass(
  object: unknown,
): object is ObjectModelClass {
  return object?.type === ObjectModelClassType;
}

export function createObjectModelClass(): ObjectModelClass {
  return {
    "type": ObjectModelClassType,
    "extends": [],
    "properties": [],
    "isCodelist": false,
  };
}

export interface ObjectModelProperty extends ObjectModelResource {

  /**
   * A single property can have multiple types, for example by inheritance
   * or data-psm choice.
   */
  dataTypes: (ObjectModelClass | ObjectModelPrimitive)[];

  cardinality: Interval;

}

export function createObjectModelProperty(): ObjectModelProperty {
  return {
    "dataTypes": [],
    "cardinality": {
      "min": 0,
    },
  };
}

interface Interval {

  min: number;

  /**
   * If not set there is no upper bound.
   */
  max?: number;

}

export interface ObjectModelPrimitive extends ObjectModelResource {

  /**
   * Used for type checking.
   */
  type: string;

  /**
   * IRI of the data type like http://www.w3.org/2001/XMLSchema#string .
   */
  dataType?: string;

}

const ObjectModelPrimitiveType = "primitive-data-type";

export function isObjectModelPrimitive(
  object: unknown,
): object is ObjectModelPrimitive {
  return object?.type === ObjectModelPrimitiveType;
}

export function createObjectModelPrimitive(): ObjectModelPrimitive {
  return {
    "type": ObjectModelPrimitiveType,
  };
}
