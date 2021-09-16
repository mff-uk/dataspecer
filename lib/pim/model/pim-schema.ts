import {CoreResource, LanguageString} from "../../core";

/**
 * Represents a schema, diagram, on PIM level. Schema on this level
 * must contains a reference to all it's parts: classes, associations,
 * and attributes.
 */
export class PimSchema extends CoreResource {

  private static readonly TYPE = "pim-schema";

  /**
   * Label used in human readable documents as a name for this resource.
   */
  pimHumanLabel: LanguageString | null = null;

  /**
   * Description, longer plain text, shown in human readable documents
   * as a description for this resource.
   */
  pimHumanDescription: LanguageString | null = null;

  pimParts: string[] = [];

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(PimSchema.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimSchema {
    return resource?.types.includes(PimSchema.TYPE);
  }

}
