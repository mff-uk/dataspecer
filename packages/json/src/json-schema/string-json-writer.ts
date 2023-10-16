import { OutputStream } from "@dataspecer/core/io/stream/output-stream";
import { JsonArrayWriter, JsonObjectWriter } from "./json-writer";

class StringJsonWriterContext {
  private readonly stream: OutputStream;

  private readonly shouldWriteComma: boolean[] = [];

  public depth: number = 1; // Because we start with an object.

  private buffer = "";

  constructor(stream: OutputStream, content: string) {
    this.stream = stream;
    this.buffer = content + "\n";
  }

  writeSeparator() {
    if (this.shouldWriteComma.pop()) {
      this.buffer += ",\n";
      this.shouldWriteComma.push(true);
    } else {
      // If it was false, we do not write but set it to true instead.
      this.shouldWriteComma.push(true);
    }
  }

  writeIndent() {
    this.buffer += " ".repeat(this.depth * 2);
  }

  openComplex() {
    this.shouldWriteComma.push(false);
    this.depth++;
  }

  closeComplex() {
    this.shouldWriteComma.pop();
    this.depth--;
  }

  async flush(): Promise<void> {
    await this.stream.write(this.buffer);
    this.buffer = "";
  }

  append(content: string) {
    this.buffer += content;
  }
}

class StringJsonObjectWriter implements JsonObjectWriter {
  private readonly context: StringJsonWriterContext;

  constructor(context: StringJsonWriterContext) {
    this.context = context;
  }

  valueIfNotNull(
    key: string,
    value: string | number | boolean | null
  ): Promise<void> {
    if (value === null) {
      return;
    }
    return this.value(key, value);
  }

  value(key: string, value: string | number | boolean | null): Promise<void> {
    this.context.writeSeparator();
    this.context.writeIndent();
    this.context.append(`"${key}": ` + valueToString(value, this.context.depth));
    return this.context.flush();
  }

  object(key: string): JsonObjectWriter {
    this.context.writeSeparator();
    this.context.writeIndent();
    this.context.append(`"${key}": {\n`);
    this.context.openComplex();
    return new StringJsonObjectWriter(this.context);
  }

  array(key: string): JsonArrayWriter {
    this.context.writeSeparator();
    this.context.writeIndent();
    this.context.append(`"${key}": [\n`);
    this.context.openComplex();
    return new StringJsonArrayWriter(this.context);
  }

  closeObject(): Promise<void> {
    this.context.append("\n");
    this.context.closeComplex();
    this.context.writeIndent();
    this.context.append("}");
    return this.context.flush();
  }
}

function valueToString(value: string | number | boolean | null | object | any[], depth: number) {
  return JSON.stringify(value, undefined, 2).split("\n").map((s, i) => i > 0 ? " ".repeat(depth * 2) + s : s).join("\n");
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
    this.context.writeIndent();
    this.context.append("" + valueToString(value, this.context.depth));
    return this.context.flush();
  }

  object(): JsonObjectWriter {
    this.context.writeSeparator();
    this.context.writeIndent();
    this.context.append("{\n");
    this.context.openComplex();
    return new StringJsonObjectWriter(this.context);
  }

  array(): JsonArrayWriter {
    this.context.writeSeparator();
    this.context.writeIndent();
    this.context.append("[\n");
    this.context.openComplex();
    return new StringJsonArrayWriter(this.context);
  }

  closeArray(): Promise<void> {
    this.context.append("\n");
    this.context.closeComplex();
    this.context.writeIndent();
    this.context.append("]");
    return this.context.flush();
  }
}

export class StringJsonWriter {
  static createObject(stream: OutputStream): JsonObjectWriter {
    const context = new StringJsonWriterContext(stream, "{");
    return new StringJsonObjectWriter(context);
  }

  static createArray(stream: OutputStream): JsonArrayWriter {
    const context = new StringJsonWriterContext(stream, "[");
    return new StringJsonArrayWriter(context);
  }
}
