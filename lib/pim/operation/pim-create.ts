import {LanguageString, CoreOperation} from "../../core";

export interface PimCreate extends CoreOperation {

  /**
   * IRI of the newly created object.
   */
  pimNewIri?:string;

  pimInterpretation?: string;

  pimTechnicalLabel?: string;

  pimHumanLabel?: LanguageString;

  pimHumanDescription?: LanguageString;

}
