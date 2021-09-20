import {
  CoreExecutorResult, CoreResource, CoreResourceReader,
} from "../../core";
import {PimSchema} from "../model";

export async function loadPimSchema(
  modelReader: CoreResourceReader,
): Promise<PimSchema | null> {
  for (const iri of await modelReader.listResources()) {
    const resource = await modelReader.readResource(iri);
    if (PimSchema.is(resource)) {
      return resource;
    }
  }
  return null;
}

/**
 * Helper class for common errors.
 */
export class PimExecutorResultFactory {

  protected constructor() {
  }

  static invalidOperation(): CoreExecutorResult {
    return CoreExecutorResult.createError(
      "Invalid operation for given executor.");
  }

  static missing(iri: string): CoreExecutorResult {
    return CoreExecutorResult.createError(
      `Missing pim resource '${iri}'.`);
  }

  static missingSchema(): CoreExecutorResult {
    return CoreExecutorResult.createError(
      "Missing pim schema object.");
  }

  static missingOwner(iri: string): CoreExecutorResult {
    return CoreExecutorResult.createError(
      `Missing pim owner '${iri}'.`);
  }

  static invalidType(
    resource: CoreResource | null, expected: string,
  ): CoreExecutorResult {
    if (resource === null) {
      return CoreExecutorResult.createError(
        `Missing resource of type ${expected}`);
    }
    const types = resource.types.join(",");
    return CoreExecutorResult.createError(
      `Resource '${resource.iri}' (${types}) `
      + `is not of expected type '${expected}'.`);
  }

}
