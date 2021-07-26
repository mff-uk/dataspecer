import {CoreModelReader} from "../../core/api";
import {asPimSchema, isPimSchema, PimSchema} from "../model";

export async function loadSchema(
  modelReader: CoreModelReader
): Promise<PimSchema> {
  for (const iri of await modelReader.listResources()) {
    const resource = await modelReader.readResource(iri);
    if (isPimSchema(resource)) {
      return {...asPimSchema(resource)};
    }
  }
  throw new Error("Missing PIM schema.");
}