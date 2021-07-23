import {CoreResource, LanguageString} from "../core-resource";

/**
 * Represents a schema, diagram, on PIM level. Schema on this level
 * must contains a reference to all it's parts: classes, associations,
 * and attributes.
 */
export class PimSchema extends CoreResource {

  static readonly TYPE: string = "pim-schema";

  /**
   * Label used in human readable documents as a name for this resource.
   */
  pimHumanLabel?: LanguageString;

  /**
   * Description, longer plain text, shown in human readable documents
   * as a description for this resource.
   */
  pimHumanDescription?: LanguageString;

  pimParts: string[] = [];

  static is(resource: CoreResource): resource is PimSchema {
    return resource.types.includes(PimSchema.TYPE);
  }

  static as(resource: CoreResource): PimSchema {
    if (PimSchema.is(resource)) {
      return resource as PimSchema;
    }
    resource.types.push(PimSchema.TYPE);
    const result = resource as PimSchema;
    result.pimParts = result.pimParts || [];
    return result;
  }

}
