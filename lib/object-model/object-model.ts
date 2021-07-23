export type LanguageString = { [language: string]: string };

/**
 * Schema is the root object that is used to identify a collection of classes,
 *
 */
export class ObjectModelSchema extends ObjectModelResource {

  /**
   * Root classes as specified by the schema.
   */
  roots: ObjectModelClass[] = [];

  /**
   * All classes in the schema including the root classes.
   */
  classes: ObjectModelClass[] = [];

}

export class ObjectModelResource {

  cimIri?: string;

  pimIri?: string;

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

export class ObjectModelClass extends ObjectModelResource {

  static readonly TYPE: string = "object-model-class";

  readonly type: string = ObjectModelClass.TYPE;

  /**
   * Class can extend other classes, the properties of other classes
   * are not included in this class.
   */
  extends: ObjectModelClass [] = [];

  /**
   * Properties declared on this class directly.
   */
  properties: ObjectModelProperty[] = [];

  static is(object: unknown): object is ObjectModelClass {
    return object?.type === ObjectModelClass.TYPE;
  }

  static as(resource: unknown): ObjectModelClass {
    return resource as ObjectModelClass;
  }

}

export class ObjectModelProperty extends ObjectModelResource {

  /**
   * A single property can have multiple types, for example by inheritance
   * or choice.
   */
  dataTypes: DataType[] = [];

  cardinality: Interval = {
    min: 1,
    max: 1
  }

}

type DataType = ObjectModelClass | ObjectModelPrimitive;

type Interval = {
  min: number;
  /**
   * If not set there is no upper bound.
   */
  max?: number;
};

export class ObjectModelPrimitive extends ObjectModelResource {

  static readonly TYPE: string = "primitive-data-type";

  readonly type: string = ObjectModelPrimitive.TYPE;

  /**
   * IRI of the data type like http://www.w3.org/2001/XMLSchema#string .
   */
  iri: string;

  static is(object: unknown): object is ObjectModelPrimitive {
    return object?.type === ObjectModelClass.TYPE;
  }

  static as(resource: unknown): ObjectModelPrimitive {
    return resource as ObjectModelPrimitive;
  }

}

