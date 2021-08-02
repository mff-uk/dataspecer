import {CoreResource} from "../../core";
import {DataPsmHumanReadableResource} from "./data-psm-resource";

/**
 * Represent a choice among multiple classes.
 */
export interface DataPsmChoice extends DataPsmHumanReadableResource {

  dataPsmParts: string[];

}

export const DataPsmChoiceType = "data-psm-choice";


export function isDataPsmChoice(
  resource: CoreResource
): resource is DataPsmChoice {
  return resource.types.includes(DataPsmChoiceType);
}

export function asDataPsmChoice(
  resource: CoreResource
): DataPsmChoice {
  if (isDataPsmChoice(resource)) {
    return resource as DataPsmChoice;
  }
  resource.types.push(DataPsmChoiceType);
  const result = resource as DataPsmChoice;
  result.dataPsmParts = result.dataPsmParts || [];
  return result;
}
