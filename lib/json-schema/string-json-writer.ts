import {OutputStream} from "../io/stream/output-stream";
import {JsonArrayWriter, JsonObjectWriter} from "./json-writer";

class StringJsonWriterContext {

  private readonly stream: OutputStream;

  buffer: string = "";

  private readonly shouldWriteComma: boolean[] = [];

  constructor(stream: OutputStream, content: string) {
    this.stream = stream;
    this.buffer = content;
  }

  writeSeparator() {
    if (this.shouldWriteComma.pop()) {
      this.buffer += ",";
      this.shouldWriteComma.push(true);
    } else {
      // If it was false, we do not write but set it to true instead.
      this.shouldWriteComma.push(true);
    }
  }

  openComplex() {
    this.shouldWriteComma.push(false);
  }

  closeComplex() {
    this.shouldWriteComma.pop();
  }

  async flush(): Promise<void> {
    await this.stream.write(this.buffer);
    this.buffer = "";
  }


}

class StringJsonObjectWriter implements JsonObjectWriter {

  private readonly context: StringJsonWriterContext;

  constructor(context: StringJsonWriterContext) {
    this.context = context;
  }

  valueIfNotNull(
    key: string, value: string | number | boolean | null
  ): Promise<void> {
    if (value === null) {
      return;
    }
    return this.value(key, value);
  }

  value(key: string, value: string | number | boolean | null): Promise<void> {
    this.context.writeSeparator();
    this.context.buffer += `"${key}":` + valueToString(value);
    return this.context.flush();
  }

  object(key: string): JsonObjectWriter {
    this.context.writeSeparator();
    this.context.buffer += `"${key}":{`;
    this.context.openComplex();
    return new StringJsonObjectWriter(this.context);
  }

  array(key: string): JsonArrayWriter {
    this.context.writeSeparator();
    this.context.buffer += `"${key}":[`;
    this.context.openComplex();
    return new StringJsonArrayWriter(this.context);
  }

  closeObject(): Promise<void> {
    this.context.buffer += "}";
    this.context.closeComplex();
    return this.context.flush();
  }

}

function valueToString(value: string | number | boolean | null) {
  if (value === null) {
    return "null";
  }
  const type = typeof value;
  if (type === "number" || type === "boolean") {
    return value;
  } else {
    return `"${value}"`;
  }
}

class StringJsonArrayWriter {

  private readonly context: StringJsonWriterContext;

  constructor(context: StringJsonWriterContext) {
    this.context = context;
  }

  valueIfNotNull(value: string | number | boolean | null): Promise<void> {
    if (value === null) {
      return;
    }
    return this.value(value);
  }

  value(value: string | number | boolean | null): Promise<void> {
    this.context.writeSeparator();
    this.context.buffer += valueToString(value);
    return this.context.flush();
  }

  object(): JsonObjectWriter {
    this.context.writeSeparator();
    this.context.buffer += "{";
    this.context.openComplex();
    return new StringJsonObjectWriter(this.context);
  }

  array(): JsonArrayWriter {
    this.context.writeSeparator();
    this.context.buffer += "[";
    this.context.openComplex();
    return new StringJsonArrayWriter(this.context);
  }

  closeArray(): Promise<void> {
    this.context.buffer += "]";
    this.context.closeComplex();
    return this.context.flush();
  }

}

export class StringJsonWriter {

  static createObject(stream: OutputStream): JsonObjectWriter {
    const context = new StringJsonWriterContext(stream, "{")
    return (new StringJsonObjectWriter(context));
  }

  static createArray(stream: OutputStream): JsonArrayWriter {
    const context = new StringJsonWriterContext(stream, "[")
    return (new StringJsonArrayWriter(context));
  }

}
