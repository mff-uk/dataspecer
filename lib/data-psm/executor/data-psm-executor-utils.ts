import {
  CoreResourceReader,
  CoreResource,
  CoreExecutorResult,
} from "../../core";
import {
  DataPsmSchema,
  DataPsmClass,
} from "../model";

export async function loadDataPsmSchema(
  reader: CoreResourceReader,
): Promise<DataPsmSchema | null> {
  for (const iri of await reader.listResources()) {
    const resource = await reader.readResource(iri);
    if (DataPsmSchema.is(resource)) {
      return resource;
    }
  }
  return null;
}

export async function loadDataPsmClass(
  reader: CoreResourceReader, iri: string,
): Promise<DataPsmClass | null> {
  const result = await reader.readResource(iri);
  if (DataPsmClass.is(result)) {
    return result;
  }
  return null;
}

/**
 * Helper class for common errors.
 */
export class DataPsmExecutorResultFactory {

  protected constructor() {
  }

  static missing(iri: string): CoreExecutorResult {
    return CoreExecutorResult.createError(
      `Missing data-psm resource '${iri}'.`);
  }

  static missingSchema(): CoreExecutorResult {
    return CoreExecutorResult.createError(
      "Missing data-psm schema object.");
  }

  static missingOwner(owner: string): CoreExecutorResult {
    return CoreExecutorResult.createError(
      `Missing data-psm owner class: '${owner}'.`);
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

export async function removeFromClass(
  reader: CoreResourceReader,
  ownerClass: string,
  entityToRemove: string,
): Promise<CoreExecutorResult> {

  const schema = await loadDataPsmSchema(reader);
  if (schema === null) {
    return DataPsmExecutorResultFactory.missingSchema();
  }

  const owner = await loadDataPsmClass(reader, ownerClass);
  if (owner === null) {
    return DataPsmExecutorResultFactory.missingOwner(ownerClass);
  }

  // We do not check if the deleted item is part of the schema nor class
  // to allow deletion of dangling objects.

  schema.dataPsmParts = removeValue(entityToRemove, schema.dataPsmParts);
  owner.dataPsmParts = removeValue(entityToRemove, owner.dataPsmParts);

  return CoreExecutorResult.createSuccess(
    [], [schema, owner], [entityToRemove]);
}

function removeValue<T>(valueToRemove: T, array: T[]): T[] {
  return array.filter(value => value !== valueToRemove);
}
