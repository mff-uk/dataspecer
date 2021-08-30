import {
  CoreResourceReader,
  CoreResource,
} from "../../core";
import {
  asDataPsmSchema,
  DataPsmSchema,
  isDataPsmSchema,
  DataPsmResource,
  isDataPsmAssociationEnd,
  isDataPsmAttribute,
  isDataPsmChoice,
  isDataPsmClass,
  isDataPsmInclude,
  isDataPsmPropertyContainer,
  DataPsmHumanReadableResource, DataPsmClass, DataPsmTechnicalResource,
} from "../model";

export async function loadDataPsmSchema(
  modelReader: CoreResourceReader,
): Promise<DataPsmSchema | null> {
  for (const iri of await modelReader.listResources()) {
    const resource = await modelReader.readResource(iri);
    if (isDataPsmSchema(resource)) {
      return {...asDataPsmSchema(resource)};
    }
  }
  return null;
}

export async function loadDataPsmResource(
  modelReader: CoreResourceReader,
  iri: string,
): Promise<DataPsmResource | null> {
  const result = await modelReader.readResource(iri);
  if (result != null && isDataPsmResource(result)) {
    return {...result};
  }
  return null;
}

function isDataPsmResource(
  resource: CoreResource | null,
): resource is DataPsmResource {
  if (resource === null) {
    return false;
  }
  return isDataPsmAssociationEnd(resource)
    || isDataPsmAttribute(resource)
    || isDataPsmClass(resource);
}

export async function loadDataPsmTechnicalResource(
  modelReader: CoreResourceReader,
  iri: string,
): Promise<DataPsmTechnicalResource | null> {
  const result = await modelReader.readResource(iri);
  if (result !== null && isDataPsmTechnicalResource(result)) {
    return {...result};
  }
  return null;
}

function isDataPsmTechnicalResource(
  resource: CoreResource | null,
): resource is DataPsmTechnicalResource {
  if (resource === null) {
    return false;
  }
  return isDataPsmAssociationEnd(resource)
    || isDataPsmAttribute(resource)
    || isDataPsmClass(resource)
    || isDataPsmSchema(resource);
}

export async function loadDataPsmHumanReadable(
  modelReader: CoreResourceReader,
  iri: string,
): Promise<DataPsmResource | null> {
  const result = await modelReader.readResource(iri);
  if (result !== null && isDataPsmHumanReadableResource(result)) {
    return {...result};
  }
  return null;
}

function isDataPsmHumanReadableResource(
  resource: CoreResource | null,
): resource is DataPsmHumanReadableResource {
  if (resource === null) {
    return false;
  }
  return isDataPsmResource(resource)
    || isDataPsmChoice(resource)
    || isDataPsmInclude(resource)
    || isDataPsmPropertyContainer(resource)
    || isDataPsmSchema(resource);
}

export async function loadDataPsmClass(
  modelReader: CoreResourceReader,
  iri: string,
): Promise<DataPsmClass | null> {
  const result = await modelReader.readResource(iri);
  if (result !== null && isDataPsmClass(result)) {
    return {...result};
  }
  return null;
}
