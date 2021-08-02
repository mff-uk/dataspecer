import {CoreResource} from "../../core";
import {
  DataPsmHumanReadableResource,
} from "./data-psm-resource";

/**
 * Originally the schema point only to root classes. The rest of the diagram
 * has been loaded by resolving the referenced entities.
 *
 * This mean that each class must be either a root class or added to
 * diagram as an association. This is not possible as in order to create
 * an association the class must already exists. So before adding the
 * association the class would need to be root class, and after the association
 * is created the class would be removed from the root class list.
 * Such approach would make it difficult to manage the schema.
 *
 * A solution is to introduce list of all parts. This list contains
 * all resources in the schema. A class can then be optionally added
 * to the list of root classes.
 */
export interface DataPsmSchema extends DataPsmHumanReadableResource {

  dataPsmRoots: string[];

  dataPsmParts: string[];

}

export const DataPsmSchemaType = "data-psm-schema";

export function isDataPsmSchema(
  resource: CoreResource
): resource is DataPsmSchema {
  return resource.types.includes(DataPsmSchemaType);
}

export function asDataPsmSchema(
  resource: CoreResource
): DataPsmSchema {
  if (isDataPsmSchema(resource)) {
    return resource as DataPsmSchema;
  }
  resource.types.push(DataPsmSchemaType);
  const result = resource as DataPsmSchema;
  result.dataPsmHumanLabel = result.dataPsmHumanLabel || {};
  result.dataPsmRoots = result.dataPsmRoots || [];
  result.dataPsmParts = result.dataPsmParts || [];
  return result;
}
