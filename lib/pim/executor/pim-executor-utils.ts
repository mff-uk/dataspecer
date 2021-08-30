import {
  CoreResourceReader,
  CoreResource,
} from "../../core";
import {
  asPimSchema, isPimAssociation, isPimAttribute, isPimClass, isPimSchema,
  PimResource, PimSchema,
} from "../model";

export async function loadPimSchema(
  modelReader: CoreResourceReader,
): Promise<PimSchema | null> {
  for (const iri of await modelReader.listResources()) {
    const resource = await modelReader.readResource(iri);
    if (isPimSchema(resource)) {
      return {...asPimSchema(resource)};
    }
  }
  return null;
}

export async function loadPimResource(
  modelReader: CoreResourceReader,
  iri: string,
): Promise<PimResource | null> {
  const result = await modelReader.readResource(iri);
  if (isPimResource(result)) {
    return result;
  }
  return null;
}

function isPimResource(
  resource: CoreResource | null,
): resource is PimResource {
  if (resource === null) {
    return false;
  }
  return isPimAssociation(resource)
    || isPimAttribute(resource)
    || isPimClass(resource)
    || isPimSchema(resource);
}
