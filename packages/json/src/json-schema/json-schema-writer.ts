import {
  JsonSchema,
  JsonSchemaAnyOf,
  JsonSchemaArray,
  JsonSchemaBoolean,
  JsonSchemaConst,
  JsonSchemaDefinition,
  JsonSchemaEnum,
  JsonSchemaNull,
  JsonSchemaNumber,
  JsonSchemaObject,
  JsonSchemaOneOf,
  JsonSchemaRef,
  JsonSchemaString,
} from "./json-schema-model";
import { OutputStream } from "@dataspecer/core/io/stream/output-stream";
import { StringJsonWriter } from "./string-json-writer";
import { JsonObjectWriter } from "./json-writer";
import { assertNot } from "@dataspecer/core/core";

export async function writeJsonSchema(
  schema: JsonSchema,
  stream: OutputStream
): Promise<void> {
  const writer = StringJsonWriter.createObject(stream);
  await writer.valueIfNotNull("$schema", schema.schema);
  await writer.valueIfNotNull("$id", schema.id);
  await writeJsonDefinition(writer, schema.root);
  await writer.closeObject();
}

async function writeJsonDefinition(
  writer: JsonObjectWriter,
  schema: JsonSchemaDefinition
): Promise<void> {
  if (JsonSchemaRef.is(schema)) {
    return writeJsonSchemaRef(writer, schema);
  }
  await writeJsonSchemaDefinitionProperties(writer, schema);
  if (JsonSchemaObject.is(schema)) {
    return writeJsonSchemaObject(writer, schema);
  } else if (JsonSchemaArray.is(schema)) {
    return writeJsonSchemaArray(writer, schema);
  } else if (JsonSchemaNull.is(schema)) {
    return writeJsonSchemaNull(writer);
  } else if (JsonSchemaBoolean.is(schema)) {
    return writeJsonSchemaBoolean(writer);
  } else if (JsonSchemaNumber.is(schema)) {
    return writeJsonSchemaNumber(writer);
  } else if (JsonSchemaString.is(schema)) {
    return writeJsonSchemaString(writer, schema);
  } else if (JsonSchemaAnyOf.is(schema)) {
    return writeJsonSchemaAnyOf(writer, schema);
  } else if (JsonSchemaOneOf.is(schema)) {
    return writeJsonSchemaOneOf(writer, schema);
  } else if (JsonSchemaConst.is(schema)) {
    return writeJsonSchemaConst(writer, schema);
  } else if (JsonSchemaEnum.is(schema)) {
    return writeJsonSchemaEnum(writer, schema);
  }
}

async function writeJsonSchemaDefinitionProperties(
  writer: JsonObjectWriter,
  schema: JsonSchemaDefinition
): Promise<void> {
  await writer.valueIfNotNull("title", schema.title);
  await writer.valueIfNotNull("description", schema.description);
}

async function writeJsonSchemaObject(
  writer: JsonObjectWriter,
  schema: JsonSchemaObject
): Promise<void> {
  await writer.value("type", "object");
  const required = writer.array("required");
  for (const key of schema.required) {
    await required.value(key);
  }
  await required.closeArray();
  const properties = writer.object("properties");
  for (const [key, value] of Object.entries(schema.properties)) {
    const property = properties.object(key);
    await writeJsonDefinition(property, value);
    await properties.closeObject();
  }
  await properties.closeObject();
}

async function writeJsonSchemaArray(
  writer: JsonObjectWriter,
  schema: JsonSchemaArray
): Promise<void> {
  await writer.value("type", "array");
  const items = writer.object("items");
  assertNot(schema.items === null, "Missing items specification.");
  await writeJsonDefinition(items, schema.items);
  await items.closeObject();
}

async function writeJsonSchemaNull(writer: JsonObjectWriter): Promise<void> {
  await writer.value("type", "null");
}

async function writeJsonSchemaBoolean(writer: JsonObjectWriter): Promise<void> {
  await writer.value("type", "boolean");
}

async function writeJsonSchemaNumber(writer: JsonObjectWriter): Promise<void> {
  await writer.value("type", "number");
}

async function writeJsonSchemaString(
  writer: JsonObjectWriter,
  schema: JsonSchemaString
): Promise<void> {
  await writer.value("type", "string");
  await writer.valueIfNotNull("format", schema.format);
}

async function writeJsonSchemaAnyOf(
  writer: JsonObjectWriter,
  schema: JsonSchemaAnyOf
): Promise<void> {
  const array = writer.array("anyOf");
  for (const definition of schema.types) {
    const valueWriter = array.object();
    await writeJsonDefinition(writer, definition);
    await valueWriter.closeObject();
  }
  await array.closeArray();
}

async function writeJsonSchemaOneOf(
  writer: JsonObjectWriter,
  schema: JsonSchemaOneOf
): Promise<void> {
  const array = writer.array("oneOf");
  for (const definition of schema.types) {
    const valueWriter = array.object();
    await writeJsonDefinition(writer, definition);
    await valueWriter.closeObject();
  }
  await array.closeArray();
}

async function writeJsonSchemaConst(
  writer: JsonObjectWriter,
  schema: JsonSchemaConst
): Promise<void> {
  await writer.value("const", schema.value);
}

async function writeJsonSchemaEnum(
  writer: JsonObjectWriter,
  schema: JsonSchemaEnum
): Promise<void> {
  const array = writer.array("enum");
  for (const value of schema.values) {
    await array.value(value);
  }
  await array.closeArray();
}

async function writeJsonSchemaRef(
  writer: JsonObjectWriter,
  schema: JsonSchemaRef
): Promise<void> {
  await writer.value("$ref", schema.url);
}
