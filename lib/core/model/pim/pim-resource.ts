import {CoreResource, LanguageString} from "../core-resource";

export class PimResource extends CoreResource {

  /**
   * Points to CIM level.
   */
  pimInterpretation?: string;

  /**
   * Label used by file formats, may represent a name of a property
   * in JSON or tag name in XML.
   */
  pimTechnicalLabel?: string;

  /**
   * Label used in human readable documents as a name for this resource.
   */
  pimHumanLabel?: LanguageString;

  /**
   * Description, longer plain text, shown in human readable documents
   * as a description for this resource.
   */
  pimHumanDescription?: LanguageString;

}
