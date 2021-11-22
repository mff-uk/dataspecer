import {
  JsonSchema, JsonSchemaAnyOf, JsonSchemaArray, JsonSchemaBoolean,
  JsonSchemaDefinition, JsonSchemaNull, JsonSchemaNumber,
  JsonSchemaObject, JsonSchemaString
} from "./json-schema-model";
import {
  assert,
  assertFailed,
  defaultStringSelector,
  StringSelector
} from "../core";
import {
  StructureModel,
  StructureModelClass, StructureModelPrimitiveType,
  StructureModelProperty
} from "../structure-model";
import {XSD} from "../well-known";

/**
 * The {@link StructureModel} must have all properties propagated to
 * in the extends hierarchy.
 */
export function structureModelToJsonSchema(
  model: StructureModel,
  stringSelector: StringSelector = defaultStringSelector,
): JsonSchema {
  const result = new JsonSchema();
  assert(model.roots.length === 1, "Exactly one root class must be provided.");
  result.root = structureModelClassToJsonObject(
    model, model.classes[model.roots[0]], stringSelector);
  return result;
}

function structureModelClassToJsonObject(
  model: StructureModel,
  modelClass: StructureModelClass,
  stringSelector: StringSelector,
): JsonSchemaObject {
  const result = new JsonSchemaObject();
  result.title = stringSelector(modelClass.humanLabel);
  result.description = stringSelector(modelClass.humanDescription);
  if (modelClass.isCodelist) {
    assertFailed("Not supported");
  }
  for (const property of modelClass.properties) {
    const name = property.technicalLabel;
    result.properties[name] = structureModelPropertyToJsonDefinition(
      model, property, stringSelector);
    if (property.cardinalityMin > 0) {
      result.required.push(name);
    }
  }
  return result;
}

function structureModelPropertyToJsonDefinition(
  model: StructureModel,
  property: StructureModelProperty,
  stringSelector: StringSelector,
): JsonSchemaDefinition {
  const dataTypes: JsonSchemaDefinition[] = [];
  for (const dataType of property.dataTypes) {
    if (dataType.isAssociation()) {
      const classData = model.classes[dataType.psmClassIri];
      dataTypes.push(structureModelClassToJsonObject(
        model, classData, stringSelector));
    } else if (dataType.isAttribute()) {
      dataTypes.push(structureModelPrimitiveToJsonDefinition(dataType));
    } else {
      assertFailed("Invalid data-type instance.");
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
  property: StructureModelProperty, definition: JsonSchemaDefinition
): JsonSchemaDefinition {
  if (property.cardinalityMax == 1) {
    return definition;
  }
  const result = new JsonSchemaArray();
  result.items = definition;
  return result;
}

function structureModelPrimitiveToJsonDefinition(
  primitive: StructureModelPrimitiveType
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
  // TODO We need a way how to get the data here.
  result.title = "";
  return result;
}
