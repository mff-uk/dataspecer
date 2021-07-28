import {CoreResource, LanguageString} from "../../core";

/**
 * Represent a container with properties. Human labels can be attached as
 * a documentation.
 */
export interface DataPsmPropertyContainer extends CoreResource {

  /**
   * Label used in human readable documents as a name for this resource.
   */
  dataPsmHumanLabel?: LanguageString;

  /**
   * Description, longer plain text, shown in human readable documents
   * as a description for this resource.
   */
  dataPsmHumanDescription?: LanguageString;

  dataPsmParts: string[];

}

export const DataPsmPropertyContainerType = "data-psm-property-container";

export function isDataPsmPropertyContainer(
  resource: CoreResource
): resource is DataPsmPropertyContainer {
  return resource.types.includes(DataPsmPropertyContainerType);
}

export function asDataPsmPropertyContainer(
  resource: CoreResource
): DataPsmPropertyContainer {
  if (isDataPsmPropertyContainer(resource)) {
    return resource as DataPsmPropertyContainer;
  }
  resource.types.push(DataPsmPropertyContainerType);
  const result = resource as DataPsmPropertyContainer;
  result.dataPsmParts = result.dataPsmParts || [];
  return result;
}
