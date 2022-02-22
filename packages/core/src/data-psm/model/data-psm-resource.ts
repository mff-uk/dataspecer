import { CoreResource, LanguageString } from "../../core";

export class DataPsmResource extends CoreResource {
  /**
   * Label used in human readable documents as a name for this resource.
   */
  dataPsmHumanLabel: LanguageString | null = null;

  /**
   * Description, longer plain text, shown in human readable documents
   * as a description for this resource.
   */
  dataPsmHumanDescription: LanguageString | null = null;

  /**
   * Label used by file formats, may represent a name of a property
   * in JSON or tag name in XML.
   */
  dataPsmTechnicalLabel: string | null = null;

  /**
   * Points to another level, most of the time PIM.
   */
  dataPsmInterpretation: string | null = null;

  protected constructor(iri: string | null) {
    super(iri);
  }
}
