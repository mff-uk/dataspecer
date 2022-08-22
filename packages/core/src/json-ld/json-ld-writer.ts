import {OutputStream} from "../io/stream/output-stream";

export async function writeJsonLd(
  schema: object,
  stream: OutputStream
): Promise<void> {
  await stream.write(JSON.stringify(schema, undefined, 2));
  await stream.close();
}
