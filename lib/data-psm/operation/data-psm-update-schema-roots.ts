import {CoreResource} from "../../core";

export interface DataPsmUpdateSchemaRoots extends CoreResource {

  dataPsmRoots: string[];

}

export const DataPsmUpdateSchemaRootsType =
  "psm-action-update-schema-schema-roots";

export function isDataPsmUpdateSchemaRoots(
  resource: CoreResource,
): resource is DataPsmUpdateSchemaRoots {
  return resource.types.includes(DataPsmUpdateSchemaRootsType);
}

export function asDataPsmUpdateSchemaRoots(
  resource: CoreResource,
): DataPsmUpdateSchemaRoots {
  if (isDataPsmUpdateSchemaRoots(resource)) {
    return resource as DataPsmUpdateSchemaRoots;
  }
  resource.types.push(DataPsmUpdateSchemaRootsType);
  const result = resource as DataPsmUpdateSchemaRoots;
  result.dataPsmRoots = result.dataPsmRoots || [];
  return result;
}
