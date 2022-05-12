import {
  JsonSchema,
  JsonSchemaAnyOf,
  JsonSchemaArray,
  JsonSchemaBoolean,
  JsonSchemaDefinition,
  JsonSchemaNull,
  JsonSchemaNumber,
  JsonSchemaObject,
  JsonSchemaRef,
  JsonSchemaString,
  JsonSchemaStringFormats,
} from "./json-schema-model";
import {
  assert,
  assertFailed,
  assertNot,
  defaultStringSelector,
  StringSelector,
} from "../core";
import {
  StructureModel,
  StructureModelClass,
  StructureModelPrimitiveType,
  StructureModelProperty,
} from "../structure-model/model/base";
import { XSD, OFN, OFN_LABELS } from "../well-known";
import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationSchema,
} from "../data-specification/model";
import { JSON_SCHEMA } from "./json-schema-vocabulary";

interface Context {
  /**
   * Active specification.
   */
  specification: DataSpecification;

  /**
   * All specifications.
   */
  specifications: { [iri: string]: DataSpecification };

  /**
   * String selector.
   */
  stringSelector: StringSelector;

  /**
   * Current structural model we are generating for.
   */
  model: StructureModel;
}

/**
 * The {@link StructureModel} must have all properties propagated to
 * in the extends hierarchy.
 */
export function structureModelToJsonSchema(
  specifications: { [iri: string]: DataSpecification },
  specification: DataSpecification,
  model: StructureModel,
  stringSelector: StringSelector = defaultStringSelector
): JsonSchema {
  const result = new JsonSchema();
  assert(model.roots.length === 1, "Exactly one root class must be provided.");
  const contex: Context = {
    specification: specification,
    specifications: specifications,
    stringSelector: stringSelector,
    model: model,
  };
  result.root = structureModelClassToJsonSchemaDefinition(
    contex,
    model.roots[0].classes[0]
  );
  return result;
}

function structureModelClassToJsonSchemaDefinition(
  context: Context,
  modelClass: StructureModelClass
): JsonSchemaDefinition {
  if (context.model.psmIri !== modelClass.structureSchema) {
    const artefact = findArtefactForImport(context, modelClass);
    if (artefact !== null) {
      const url = artefact.publicUrl;
      const reference = new JsonSchemaRef();
      reference.url = url;
      return reference;
    }
  }
  if (modelClass.isCodelist) {
    return structureModelClassCodelist();
  }
  if (modelClass.properties.length === 0) {
    return structureModelClassEmpty();
  }
  const result = new JsonSchemaObject();
  result.title = context.stringSelector(modelClass.humanLabel);
  result.description = context.stringSelector(modelClass.humanDescription);
  for (const property of modelClass.properties) {
    const name = property.technicalLabel;
    result.properties[name] = structureModelPropertyToJsonDefinition(
      context,
      property
    );
    if (property.cardinalityMin > 0) {
      result.required.push(name);
    }
  }
  return result;
}

function findArtefactForImport(
  context: Context,
  modelClass: StructureModelClass
): DataSpecificationArtefact | null {
  const targetSpecification = context.specifications[modelClass.specification];
  assertNot(
    targetSpecification === undefined,
    `Missing specification ${modelClass.specification}`
  );
  for (const candidate of targetSpecification.artefacts) {
    if (candidate.generator !== JSON_SCHEMA.Generator) {
      continue;
    }
    const candidateSchema = candidate as DataSpecificationSchema;
    if (modelClass.structureSchema !== candidateSchema.psm) {
      continue;
    }
    // TODO We should check that the class is root here.
    return candidate;
  }
  return null;
}

function structureModelClassCodelist(): JsonSchemaDefinition {
  return new JsonSchemaString(JsonSchemaStringFormats.iri);
}

function structureModelClassEmpty(): JsonSchemaDefinition {
  return new JsonSchemaString(JsonSchemaStringFormats.iri);
}

function structureModelPropertyToJsonDefinition(
  context: Context,
  property: StructureModelProperty
): JsonSchemaDefinition {
  const dataTypes: JsonSchemaDefinition[] = [];
  for (const dataType of property.dataTypes) {
    if (dataType.isAssociation()) {
      const classData = dataType.dataType;
      dataTypes.push(
        structureModelClassToJsonSchemaDefinition(context, classData)
      );
    } else if (dataType.isAttribute()) {
      dataTypes.push(
        structureModelPrimitiveToJsonDefinition(context, dataType)
      );
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
  result.title = context.stringSelector(property.humanLabel);
  result.description = context.stringSelector(property.humanDescription);
  return wrapWithCardinality(property, result);
}

function wrapWithCardinality(
  property: StructureModelProperty,
  definition: JsonSchemaDefinition
): JsonSchemaDefinition {
  if (property.cardinalityMax == 1) {
    return definition;
  }
  const result = new JsonSchemaArray();
  result.items = definition;
  return result;
}

function structureModelPrimitiveToJsonDefinition(
  context: Context,
  primitive: StructureModelPrimitiveType
): JsonSchemaDefinition {
  let result;
  switch (primitive.dataType) {
    case XSD.string:
    case OFN.string:
      result = new JsonSchemaString(null);
      result.title = context.stringSelector(OFN_LABELS[OFN.string]);
      break;
    case XSD.decimal:
    case OFN.decimal:
      result = new JsonSchemaNumber();
      result.title = context.stringSelector(OFN_LABELS[OFN.decimal]);
      break;
    case XSD.integer:
    case OFN.integer:
      result = new JsonSchemaNumber();
      result.title = context.stringSelector(OFN_LABELS[OFN.integer]);
      break;
    case XSD.boolean:
    case OFN.boolean:
      result = new JsonSchemaBoolean();
      result.title = context.stringSelector(OFN_LABELS[OFN.boolean]);
      break;
    case OFN.time:
      result = new JsonSchemaString(JsonSchemaStringFormats.time);
      result.title = context.stringSelector(OFN_LABELS[OFN.time]);
      break;
    case OFN.date:
      result = new JsonSchemaString(JsonSchemaStringFormats.date);
      result.title = context.stringSelector(OFN_LABELS[OFN.date]);
      break;
    case OFN.dateTime:
      result = new JsonSchemaString(JsonSchemaStringFormats.dateTime);
      result.title = context.stringSelector(OFN_LABELS[OFN.dateTime]);
      break;
    case OFN.url:
      result = new JsonSchemaString(JsonSchemaStringFormats.iri);
      result.title = context.stringSelector(OFN_LABELS[OFN.url]);
      break;
    case OFN.text:
      result = languageString();
      result.title = context.stringSelector(OFN_LABELS[OFN.text]);
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
