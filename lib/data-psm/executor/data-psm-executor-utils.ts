import {
  CoreModelReader,
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
  DataPsmHumanReadableResource, DataPsmClass,
} from "../model";

export async function loadDataPsmSchema(
  modelReader: CoreModelReader,
): Promise<DataPsmSchema | undefined> {
  for (const iri of await modelReader.listResources()) {
    const resource = await modelReader.readResource(iri);
    if (isDataPsmSchema(resource)) {
      return {...asDataPsmSchema(resource)};
    }
  }
  return undefined;
}

export async function loadDataPsmResource(
  modelReader: CoreModelReader,
  iri: string,
): Promise<DataPsmResource | undefined> {
  const result = await modelReader.readResource(iri);
  if (isDataPsmResource(result)) {
    return {...result};
  }
  return undefined;
}

function isDataPsmResource(
  resource: CoreResource | undefined,
): resource is DataPsmResource {
  if (resource === undefined) {
    return false;
  }
  return isDataPsmAssociationEnd(resource)
    || isDataPsmAttribute(resource)
    || isDataPsmClass(resource);
}

export async function loadDataPsmHumanReadable(
  modelReader: CoreModelReader,
  iri: string,
): Promise<DataPsmResource | undefined> {
  const result = await modelReader.readResource(iri);
  if (isDataPsmHumanReadableResource(result)) {
    return {...result};
  }
  return undefined;
}

function isDataPsmHumanReadableResource(
  resource: CoreResource | undefined,
): resource is DataPsmHumanReadableResource {
  if (resource === undefined) {
    return false;
  }
  return isDataPsmResource(resource)
    || isDataPsmChoice(resource)
    || isDataPsmInclude(resource)
    || isDataPsmPropertyContainer(resource)
    || isDataPsmSchema(resource);
}

export async function loadDataPsmClass(
  modelReader: CoreModelReader,
  iri: string,
): Promise<DataPsmClass | undefined> {
  const result = await modelReader.readResource(iri);
  if (isDataPsmClass(result)) {
    return {...result};
  }
  return undefined;
}
