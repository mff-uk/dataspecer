import {CoreOperation, CoreResource} from "../../core";

export interface DataPsmUpdateAttributeDatatype extends CoreOperation {

  dataPsmAttribute?: string;

  dataPsmDatatype?: string;

}

export const DataPsmUpdateAttributeDatatypeType =
  "psm-action-update-attribute-datatype";

export function isDataPsmUpdateAttributeDatatype(
  resource: CoreResource,
): resource is DataPsmUpdateAttributeDatatype {
  return resource.types.includes(DataPsmUpdateAttributeDatatypeType);
}

export function asDataPsmUpdateAttributeDatatype(
  resource: CoreResource,
): DataPsmUpdateAttributeDatatype {
  if (isDataPsmUpdateAttributeDatatype(resource)) {
    return resource as DataPsmUpdateAttributeDatatype;
  }
  resource.types.push(DataPsmUpdateAttributeDatatypeType);
  return resource as DataPsmUpdateAttributeDatatype;
}
