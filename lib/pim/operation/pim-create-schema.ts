import {
  CoreOperation,
  CoreResource, CoreTyped,
  LanguageString,
} from "../../core";

export interface PimCreateSchema extends CoreOperation {

  /**
   * IRI of the newly created object.
   */
  pimNewIri?: string;

  pimHumanLabel?: LanguageString;

  pimHumanDescription?: LanguageString;

  pimBaseIri?: string;

}

export const PimCreateSchemaType = "pim-action-create-schema";

export function isPimCreateSchema(
  resource: CoreResource,
): resource is PimCreateSchema {
  return resource.types.includes(PimCreateSchemaType);
}

export function asPimCreateSchema(
  resource: CoreResource,
): PimCreateSchema {
  if (isPimCreateSchema(resource)) {
    return resource as PimCreateSchema;
  }
  resource.types.push(PimCreateSchemaType);
  return resource as PimCreateSchema;
}

export interface PimCreateSchemaResult extends CoreTyped {

  createdPimSchema: string;

}

export const PimCreateSchemaResultType =
  "pim-action-create-schema-result";

export function isPimCreateSchemaResult(
  resource: CoreTyped,
): resource is PimCreateSchemaResult {
  return resource.types.includes(PimCreateSchemaResultType);
}

export function createPimCreateSchemaResultProperties(
  createdPimSchema: string,
): PimCreateSchemaResult {
  return {
    "types": [PimCreateSchemaResultType],
    "createdPimSchema": createdPimSchema,
  };
}
