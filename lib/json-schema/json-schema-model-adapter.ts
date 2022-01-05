import {
  JsonSchema, JsonSchemaAnyOf, JsonSchemaArray, JsonSchemaBoolean,
  JsonSchemaDefinition, JsonSchemaNull, JsonSchemaNumber,
  JsonSchemaObject, JsonSchemaString, JsonSchemaStringFormats,
} from "./json-schema-model";
import {
  assert,
  assertFailed,
  defaultStringSelector,
  StringSelector,
} from "../core";
import {
  StructureModel,
  StructureModelClass, StructureModelPrimitiveType,
  StructureModelProperty,
} from "../structure-model";
import {XSD, OFN, OFN_LABELS} from "../well-known";

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
  result.root = structureModelClassToJsonSchemaDefinition(
    model, model.classes[model.roots[0]], stringSelector);
  return result;
}

function structureModelClassToJsonSchemaDefinition(
  model: StructureModel,
  modelClass: StructureModelClass,
  stringSelector: StringSelector,
): JsonSchemaDefinition {
  if (modelClass.isCodelist) {
    return structureModelClassCodelist();
  }
  if (modelClass.properties.length === 0) {
    return structureModelClassEmpty();
  }
  const result = new JsonSchemaObject();
  result.title = stringSelector(modelClass.humanLabel);
  result.description = stringSelector(modelClass.humanDescription);
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

function structureModelClassCodelist(): JsonSchemaDefinition {
  return new JsonSchemaString(JsonSchemaStringFormats.iri);
}

function structureModelClassEmpty(): JsonSchemaDefinition {
  return new JsonSchemaString(JsonSchemaStringFormats.iri);
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
      dataTypes.push(structureModelClassToJsonSchemaDefinition(
        model, classData, stringSelector));
    } else if (dataType.isAttribute()) {
      dataTypes.push(structureModelPrimitiveToJsonDefinition(
        dataType, stringSelector));
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
  property: StructureModelProperty, definition: JsonSchemaDefinition,
): JsonSchemaDefinition {
  if (property.cardinalityMax == 1) {
    return definition;
  }
  const result = new JsonSchemaArray();
  result.items = definition;
  return result;
}

function structureModelPrimitiveToJsonDefinition(
  primitive: StructureModelPrimitiveType,
  selectString: StringSelector,
): JsonSchemaDefinition {
  let result;
  switch (primitive.dataType) {
    case XSD.string:
    case OFN.string:
      result = new JsonSchemaString(null);
      result.title = selectString(OFN_LABELS[OFN.string]);
      break;
    case XSD.decimal:
    case OFN.decimal:
      result = new JsonSchemaNumber();
      result.title = selectString(OFN_LABELS[OFN.decimal]);
      break;
    case XSD.integer:
    case OFN.integer:
      result = new JsonSchemaNumber();
      result.title = selectString(OFN_LABELS[OFN.integer]);
      break;
    case XSD.boolean:
    case OFN.boolean:
      result = new JsonSchemaBoolean();
      result.title = selectString(OFN_LABELS[OFN.boolean]);
      break;
    case OFN.time:
      result = new JsonSchemaString(JsonSchemaStringFormats.time);
      result.title = selectString(OFN_LABELS[OFN.time]);
      break;
    case OFN.date:
      result = new JsonSchemaString(JsonSchemaStringFormats.date);
      result.title = selectString(OFN_LABELS[OFN.date]);
      break;
    case OFN.dateTime:
      result = new JsonSchemaString(JsonSchemaStringFormats.dateTime);
      result.title = selectString(OFN_LABELS[OFN.dateTime]);
      break;
    case OFN.url:
      result = new JsonSchemaString(JsonSchemaStringFormats.iri);
      result.title = selectString(OFN_LABELS[OFN.url]);
      break;
    case OFN.text:
      result = languageString();
      result.title = selectString(OFN_LABELS[OFN.text]);
      break;
    default:
      result = new JsonSchemaString(null);
      result.title = primitive.dataType;
      break;
  }
  return result;
}

function languageString(): JsonSchemaObject {
  const result = new JsonSchemaObject();

  const cs = new JsonSchemaString(null);
  result.properties["cs"] = cs;
  cs.title = "Hodnota v českém jazyce";

  const en = new JsonSchemaString(null);
  result.properties["en"] = en;
  en.title = "Hodnota v anglickém jazyce";

  return result;
}
