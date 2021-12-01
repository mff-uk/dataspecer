export class JsonSchema {

  schema: string | null = "https://json-schema.org/draft/2020-12/schema";

  id: string | null = null;

  root: JsonSchemaDefinition | null = null;

}

export class JsonSchemaDefinition {

  readonly type: string;

  title: string | null = null;

  description: string | null = null;

  constructor(type: string) {
    this.type = type;
  }

}

export class JsonSchemaObject extends JsonSchemaDefinition {

  private static TYPE = "json-schema-object";

  properties: { [name: string]: JsonSchemaDefinition } = {};

  required: string[] = [];

  constructor() {
    super(JsonSchemaObject.TYPE);
  }

  static is(resource: JsonSchemaDefinition): resource is JsonSchemaObject {
    return resource.type.includes(JsonSchemaObject.TYPE);
  }

}

export class JsonSchemaArray extends JsonSchemaDefinition {

  private static TYPE = "json-schema-array";

  items: JsonSchemaDefinition | null = null;

  /**
   * Definition of items that must be part of the array.
   */
  contains: JsonSchemaDefinition[] = [];

  constructor() {
    super(JsonSchemaArray.TYPE);
  }

  static is(resource: JsonSchemaDefinition): resource is JsonSchemaArray {
    return resource.type.includes(JsonSchemaArray.TYPE);
  }

}

export class JsonSchemaNull extends JsonSchemaDefinition {

  private static TYPE = "json-schema-null";

  constructor() {
    super(JsonSchemaNull.TYPE);
  }

  static is(resource: JsonSchemaDefinition): resource is JsonSchemaNull {
    return resource.type.includes(JsonSchemaNull.TYPE);
  }

}

export class JsonSchemaBoolean extends JsonSchemaDefinition {

  private static TYPE = "json-schema-boolean";

  constructor() {
    super(JsonSchemaBoolean.TYPE);
  }

  static is(resource: JsonSchemaDefinition): resource is JsonSchemaBoolean {
    return resource.type.includes(JsonSchemaBoolean.TYPE);
  }

}

export class JsonSchemaNumber extends JsonSchemaDefinition {

  private static TYPE = "json-schema-number";

  constructor() {
    super(JsonSchemaNumber.TYPE);
  }

  static is(resource: JsonSchemaDefinition): resource is JsonSchemaNumber {
    return resource.type.includes(JsonSchemaNumber.TYPE);
  }

}

export class JsonSchemaString extends JsonSchemaDefinition {

  private static TYPE = "json-schema-string";

  // iri
  format: string | null = null;

  constructor() {
    super(JsonSchemaString.TYPE);
  }

  static is(resource: JsonSchemaDefinition): resource is JsonSchemaString {
    return resource.type.includes(JsonSchemaString.TYPE);
  }

}

// https://ofn.gov.cz/základní-datové-typy/2020-07-01/schémata/text.json
export class JsonSchemaAnyOf extends JsonSchemaDefinition {

  private static TYPE = "json-schema-any-of";

  types: JsonSchemaDefinition[] = [];

  constructor() {
    super(JsonSchemaAnyOf.TYPE);
  }

  static is(resource: JsonSchemaDefinition): resource is JsonSchemaAnyOf {
    return resource.type.includes(JsonSchemaAnyOf.TYPE);
  }

}

// https://ofn.gov.cz/umístění/2020-07-01/schémata/umístění.json
export class JsonSchemaOneOf extends JsonSchemaDefinition {

  private static TYPE = "json-schema-one-of";

  types: JsonSchemaDefinition[] = [];

  constructor() {
    super(JsonSchemaOneOf.TYPE);
  }

  static is(resource: JsonSchemaDefinition): resource is JsonSchemaOneOf {
    return resource.type.includes(JsonSchemaOneOf.TYPE);
  }

}

export class JsonSchemaConst extends JsonSchemaDefinition {

  private static TYPE = "json-schema-const";

  value: string | number | boolean | null = null;

  constructor() {
    super(JsonSchemaConst.TYPE);
  }

  static is(resource: JsonSchemaDefinition): resource is JsonSchemaConst {
    return resource.type.includes(JsonSchemaConst.TYPE);
  }

}

// https://raw.githubusercontent.com/ropensci/geojsonlint/master/inst/schema/geojson.json
export class JsonSchemaEnum extends JsonSchemaDefinition {

  private static TYPE = "json-schema-enum";

  values: (string | number | boolean)[] = [];

  constructor() {
    super(JsonSchemaEnum.TYPE);
  }

  static is(resource: JsonSchemaDefinition): resource is JsonSchemaEnum {
    return resource.type.includes(JsonSchemaEnum.TYPE);
  }

}
