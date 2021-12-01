import {CoreResource, LanguageString} from "../../core";

export class PimResource extends CoreResource {

  /**
   * Points to CIM level.
   */
  pimInterpretation: string | null = null;

  /**
   * Label used by file formats, may represent a name of a property
   * in JSON or tag name in XML.
   */
  pimTechnicalLabel: string | null = null;

  /**
   * Label used in human readable documents as a name for this resource.
   */
  pimHumanLabel: LanguageString | null = null;

  /**
   * Description, longer plain text, shown in human readable documents
   * as a description for this resource.
   */
  pimHumanDescription: LanguageString | null = null;

  protected constructor(iri: string | null) {
    super(iri);
  }

}
