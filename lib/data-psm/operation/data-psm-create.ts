import {LanguageString, CoreOperation} from "../../core";

export interface DataPsmCreate extends CoreOperation {

  /**
   * IRI of the newly created object.
   */
  dataPsmNewIri?:string;

  dataPsmInterpretation?: string;

  dataPsmTechnicalLabel?: string;

  dataPsmHumanLabel?: LanguageString

  dataPsmHumanDescription?: LanguageString;

}
