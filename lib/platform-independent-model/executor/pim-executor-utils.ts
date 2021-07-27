import {CoreModelReader} from "../../core";
import {asPimSchema, isPimSchema, PimSchema} from "../model";

export async function loadPimSchema(
  modelReader: CoreModelReader
): Promise<PimSchema | undefined> {
  for (const iri of await modelReader.listResources()) {
    const resource = await modelReader.readResource(iri);
    if (isPimSchema(resource)) {
      return {...asPimSchema(resource)};
    }
  }
  return undefined;
}
