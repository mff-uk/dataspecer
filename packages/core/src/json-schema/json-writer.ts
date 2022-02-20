export interface JsonObjectWriter {
  valueIfNotNull(
    key: string,
    value: string | number | boolean | null
  ): Promise<void>;

  value(key: string, value: string | number | boolean | null): Promise<void>;

  object(key: string): JsonObjectWriter;

  array(key: string): JsonArrayWriter;

  closeObject(): Promise<void>;
}

export interface JsonArrayWriter {
  valueIfNotNull(value: string | number | boolean | null): Promise<void>;

  value(value: string | number | boolean | null): Promise<void>;

  object(): JsonObjectWriter;

  array(): JsonArrayWriter;

  closeArray(): Promise<void>;
}
