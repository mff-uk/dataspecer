import {CoreResource, LanguageString} from "../../core";

export interface DataPsmResource extends CoreResource {

  /**
   * Points to PIM level.
   */
  dataPsmInterpretation?: string;

  /**
   * Label used by file formats, may represent a name of a property
   * in JSON or tag name in XML.
   */
  dataPsmTechnicalLabel?: string;

  /**
   * Label used in human readable documents as a name for this resource.
   */
  dataPsmHumanLabel?: LanguageString;

  /**
   * Description, longer plain text, shown in human readable documents
   * as a description for this resource.
   */
  dataPsmHumanDescription?: LanguageString;

}
