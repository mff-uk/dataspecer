import {CoreResource} from "../../core";
import {DataPsmHumanReadableResource} from "./data-psm-resource";

/**
 * Represent a container with properties. Human labels can be attached as
 * a documentation.
 */
export interface DataPsmPropertyContainer extends DataPsmHumanReadableResource {

  dataPsmParts: string[];

}

export const DataPsmPropertyContainerType = "data-psm-property-container";

export function isDataPsmPropertyContainer(
  resource: CoreResource | null,
): resource is DataPsmPropertyContainer {
  return resource !== null
    && resource.types.includes(DataPsmPropertyContainerType);
}

export function asDataPsmPropertyContainer(
  resource: CoreResource,
): DataPsmPropertyContainer {
  if (isDataPsmPropertyContainer(resource)) {
    return resource as DataPsmPropertyContainer;
  }
  resource.types.push(DataPsmPropertyContainerType);
  const result = resource as DataPsmPropertyContainer;
  result.dataPsmParts = result.dataPsmParts || [];
  return result;
}
