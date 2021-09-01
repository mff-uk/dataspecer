import {CoreResource, LanguageString} from "../../core";

/**
 * Represents a schema, diagram, on PIM level. Schema on this level
 * must contains a reference to all it's parts: classes, associations,
 * and attributes.
 */
export interface PimSchema extends CoreResource {

  /**
   * Label used in human readable documents as a name for this resource.
   */
  pimHumanLabel?: LanguageString;

  /**
   * Description, longer plain text, shown in human readable documents
   * as a description for this resource.
   */
  pimHumanDescription?: LanguageString;

  pimParts: string[];

}

const PimSchemaType = "pim-schema";

export function isPimSchema(
  resource: CoreResource | null,
): resource is PimSchema {
  return resource !== null
    && resource.types.includes(PimSchemaType);
}

export function asPimSchema(resource: CoreResource): PimSchema {
  if (isPimSchema(resource)) {
    return resource as PimSchema;
  }
  resource.types.push(PimSchemaType);
  const result = resource as PimSchema;
  result.pimParts = result.pimParts || [];
  return result;
}
