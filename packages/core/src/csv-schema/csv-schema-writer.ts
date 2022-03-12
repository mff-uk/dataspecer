import { CsvSchema } from "./csv-schema-model";
import { OutputStream } from "../io/stream/output-stream";

export async function writeCsvSchema(
    schema: CsvSchema,
    stream: OutputStream
) : Promise<void> {
    await stream.write(JSON.stringify(schema, null, 4));
}
