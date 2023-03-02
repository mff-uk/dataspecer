import {
  JsonSchema,
  JsonSchemaAnyOf,
  JsonSchemaArray,
  JsonSchemaBoolean,
  JsonSchemaConst,
  JsonSchemaCustomType,
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
import { JsonArrayWriter, JsonObjectWriter } from "./json-writer";
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
  } else if (JsonSchemaCustomType.is(schema)) {
    return writeJsonSchemaCustomType(writer, schema);
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
  await writer.valueIfNotNull("pattern", schema.pattern);
  if (schema.examples && schema.examples.length > 0) {
    const array = writer.array("examples");
    for (const example of schema.examples) {
      await array.value(example);
    }
    await array.closeArray();
  }
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

async function writeJsonSchemaCustomType(
  writer: JsonObjectWriter,
  schema: JsonSchemaCustomType
): Promise<void> {
  await objectToJsonWriter(schema.data as Record<string, unknown>, writer);
}

async function objectToJsonWriter(o: Record<string, unknown>, writer: JsonObjectWriter) {
  for (const [key, value] of Object.entries(o)) {
    // value is array
    if (Array.isArray(value)) {
      const array = writer.array(key);
      await arrayToJsonWriter(value, array);
      await array.closeArray();
    } else if (typeof value === "object") {
      const object = writer.object(key);
      await objectToJsonWriter(value as Record<string, unknown>, object);
      await object.closeObject();
    } else {
      await writer.value(key, value as string);
    }
  }
}

async function arrayToJsonWriter(a: unknown[], writer: JsonArrayWriter) {
  for (const item of a) {
    if (Array.isArray(item)) {
      const array = writer.array();
      await arrayToJsonWriter(item, array);
      await array.closeArray();
    } else if (typeof item === "object") {
      const object = writer.object();
      await objectToJsonWriter(item as Record<string, unknown>, object);
      await object.closeObject();
    } else {
      await writer.value(item as string);
    }
  }
}
