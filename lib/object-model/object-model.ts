export type LanguageString = { [language: string]: string };

/**
 * Schema is the root object that is used to identify a collection of classes.
 * We can see schema as a diagram that contains the class definitions.
 */
export class ObjectModelSchema {

  /**
   * IRI of parent entity in the data-psm level.
   */
  psmIri: string | null = null;

  /**
   * Label used by a computer, can be used as for example as a name of
   * a property in JSON.
   */
  technicalLabel: string | null = null;

  /**
   * Label visible to a human reader.
   */
  humanLabel: LanguageString | null = null;

  /**
   * Description visible to a human reader.
   */
  humanDescription: LanguageString | null = null;

  /**
   * Root classes as specified by the data-psm schema.
   */
  roots: ObjectModelClass[] = [];

  /**
   * All classes in the schema including the root classes.
   */
  classes: ObjectModelClass[] = [];

}

/**
 * Base class for each entity, even for schema, in the object model.
 */
export class ObjectModelResource {

  /**
   * The cim level is optional as the pim level may not have an interpretation.
   */
  cimIri: string | null = null;

  /**
   * The pim level is optional is data-psm level may not have an interpretation.
   */
  pimIri: string | null = null;

  /**
   * IRI of parent entity in the data-psm level.
   */
  psmIri: string | null = null;

  /**
   * Label used by a computer, can be used as for example as a name of
   * a property in JSON.
   */
  technicalLabel: string | null = null;

  /**
   * Label visible to a human reader.
   */
  humanLabel: LanguageString | null = null;

  /**
   * Description visible to a human reader.
   */
  humanDescription: LanguageString | null = null;

}

export class ObjectModelClass extends ObjectModelResource {

  private static readonly TYPE = "object-model-class";

  /**
   * Used for type checking.
   */
  type: string = ObjectModelClass.TYPE;

  /**
   * Class can extend other classes, the properties of other classes
   * are not included in this class.
   */
  extends: ObjectModelClass [] = [];

  /**
   * Properties declared on this class directly. The list is ordered.
   */
  properties: ObjectModelProperty[] = [];

  /**
   * If set to true values of this class are available in a codelist.
   */
  isCodelist = false;

  static is(object: any | null): object is ObjectModelClass {
    return object !== null && object?.type === ObjectModelClass.TYPE;
  }

}

export class ObjectModelProperty extends ObjectModelResource {

  /**
   * A single property can have multiple types, for example by inheritance
   * or data-psm choice.
   */
  dataTypes: (ObjectModelClass | ObjectModelPrimitive)[] = [];

  cardinality: ObjectModelInterval = {
    "min": 0,
    "max": null,
  };

}

export interface ObjectModelInterval {

  min: number;

  /**
   * If not set there is no upper bound.
   */
  max: number | null;

}

export class ObjectModelPrimitive extends ObjectModelResource {

  private static readonly TYPE = "primitive-data-type";

  /**
   * Used for type checking.
   */
  type: string = ObjectModelPrimitive.TYPE;

  /**
   * IRI of the data type like http://www.w3.org/2001/XMLSchema#string .
   */
  dataType: string | null;

  static is(object: any | null): object is ObjectModelPrimitive {
    return object != null && object?.type === ObjectModelPrimitive.TYPE;
  }

}
