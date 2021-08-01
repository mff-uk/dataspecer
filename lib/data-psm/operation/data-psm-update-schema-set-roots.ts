import {CoreResource, LanguageString} from "../../core";

export interface DataPsmUpdateSchemaSetRoots extends CoreResource {

  dataPsmRoot: string[];

}

export const DataPsmUpdateSchemaSetRootsType =
  "psm-action-update-schema-schema-roots";

export function isDataPsmUpdateSchemaSetRoots(
  resource: CoreResource
): resource is DataPsmUpdateSchemaSetRoots {
  return resource.types.includes(DataPsmUpdateSchemaSetRootsType);
}

export function asDataPsmUpdateSchemaSetRoots(
  resource: CoreResource
): DataPsmUpdateSchemaSetRoots {
  if (isDataPsmUpdateSchemaSetRoots(resource)) {
    return resource as DataPsmUpdateSchemaSetRoots;
  }
  resource.types.push(DataPsmUpdateSchemaSetRootsType);
  const result = resource as DataPsmUpdateSchemaSetRoots;
  result.dataPsmRoot = result.dataPsmRoot || [];
  return result;
}
