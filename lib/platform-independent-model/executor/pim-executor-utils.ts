import {
  CoreModelReader,
  CoreResource,
} from "../../core";
import {
  asPimSchema, isPimAssociation, isPimAttribute, isPimClass, isPimSchema,
  PimResource, PimSchema
} from "../model";

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

export async function loadPimResource(
  modelReader: CoreModelReader,
  iri: string
): Promise<PimResource | undefined> {
  const result = await modelReader.readResource(iri);
  if (isPimResource(result)) {
    return result;
  }
  return undefined;
}

function isPimResource(
  resource: CoreResource | undefined
): resource is PimResource {
  if (resource === undefined) {
    return false;
  }
  return isPimAssociation(resource)
    || isPimAttribute(resource)
    || isPimClass(resource)
    || isPimSchema(resource);
}
