import {CoreResource} from "../../core";

/**
 * This resource can be used as a part of a class, instead of  a particular
 * attribute or association end. This resource act as a syntactic sugar
 * and perform an include of given attribute list in place of this attribute.
 */
export interface DataPsmInclude extends CoreResource {

  dataPsmParts: string[];

}

export const DataPsmIncludeType = "data-psm-include";


export function isDataPsmInclude(
  resource: unknown,
): resource is DataPsmInclude {
  return resource !== null
    && resource?.types?.includes(DataPsmIncludeType);
}

export function asDataPsmInclude(
  resource: CoreResource,
): DataPsmInclude {
  if (isDataPsmInclude(resource)) {
    return resource as DataPsmInclude;
  }
  resource.types.push(DataPsmIncludeType);
  const result = resource as DataPsmInclude;
  result.dataPsmParts = result.dataPsmParts || [];
  return result;
}
