import {
  ObjectModelClass, ObjectModelPrimitive,
  ObjectModelProperty,
  ObjectModelSchema,
  StringSelector,
  collectClassPropertiesFromParents,
  XSD,
} from "../object-model";
import {
  JsonSchema, JsonSchemaAnyOf, JsonSchemaArray, JsonSchemaBoolean,
  JsonSchemaDefinition, JsonSchemaNull, JsonSchemaNumber,
  JsonSchemaObject, JsonSchemaString
} from "./json-schema-model";
import {assert, assertFailed} from "../core";


export function objectModelToJsonSchema(
  schema: ObjectModelSchema,
  stringSelector: StringSelector,
): JsonSchema {
  const result = new JsonSchema();
  assert(schema.roots.length === 1, "Exactly one root class must be provided.");
  result.root = objectModelClassToJsonObject(schema.roots[0], stringSelector);
  return result;
}

export function objectModelClassToJsonObject(
  modelClass: ObjectModelClass,
  stringSelector: StringSelector,
): JsonSchemaObject {
  const result = new JsonSchemaObject();
  result.title = stringSelector(modelClass.humanLabel);
  result.description = stringSelector(modelClass.humanDescription);
  if (modelClass.isCodelist) {
    assertFailed("Not supported");
  }
  const properties = collectClassPropertiesFromParents(modelClass);
  for (const property of properties) {
    const name = propertyLabel(property);
    result.properties[name] = objectModelPropertyToJsonDefinition(
      property, stringSelector);
    if (property.cardinality.min > 0) {
      result.required.push(name);
    }
  }
  return result;
}

function propertyLabel(property: ObjectModelProperty): string {
  return property.technicalLabel ?? property.psmIri;
}

function objectModelPropertyToJsonDefinition(
  property: ObjectModelProperty,
  stringSelector: StringSelector,
): JsonSchemaDefinition {
  const dataTypes: JsonSchemaDefinition[] = [];
  for (const dataType of property.dataTypes) {
    if (ObjectModelClass.is(dataType)) {
      dataTypes.push(objectModelClassToJsonObject(
        dataType, stringSelector));
    } else if (ObjectModelPrimitive.is(dataType)) {
      dataTypes.push(objectModelPrimitiveToJsonDefinition(
        dataType, stringSelector));
    } else {
      assertFailed("Invalid ObjectModelProperty instance.");
    }
  }
  let result;
  if (dataTypes.length === 0) {
    // We have no type specification so we select null.
    result = new JsonSchemaNull();
  } else if (dataTypes.length === 1) {
    // Just one type.
    result = dataTypes[0];
  } else {
    // Multiple types.
    result = new JsonSchemaAnyOf();
    result.types = dataTypes;
  }
  //
  result.title = stringSelector(property.humanLabel);
  result.description = stringSelector(property.humanDescription);
  return wrapWithCardinality(property, result);
}

function wrapWithCardinality(
  property: ObjectModelProperty, definition: JsonSchemaDefinition
): JsonSchemaDefinition {
  const cardinality = property.cardinality;
  if (cardinality.max == 1) {
    return definition;
  }
  const result = new JsonSchemaArray();
  result.items = definition;
  return result;
}

function objectModelPrimitiveToJsonDefinition(
  primitive: ObjectModelPrimitive,
  stringSelector: StringSelector,
): JsonSchemaDefinition {
  let result: JsonSchemaDefinition;
  switch (primitive.dataType) {
    case XSD.string:
      result = new JsonSchemaString();
      break;
    case XSD.decimal:
      result = new JsonSchemaNumber();
      break;
    case XSD.integer:
      result = new JsonSchemaNumber();
      break;
    case XSD.boolean:
      result = new JsonSchemaBoolean();
      break;
    default:
      result = new JsonSchemaString();
      break;
  }
  result.title = stringSelector(primitive.humanLabel);
  result.description = stringSelector(primitive.humanDescription);
  return result;
}
