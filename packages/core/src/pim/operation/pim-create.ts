import {LanguageString, CoreOperation} from "../../core";

export class PimCreate extends CoreOperation {

  /**
   * IRI of the newly created object.
   */
  pimNewIri: string | null = null;

  pimInterpretation: string | null = null;

  pimTechnicalLabel: string | null = null;

  pimHumanLabel: LanguageString | null = null;

  pimHumanDescription: LanguageString | null = null;

  protected constructor() {
    super();
  }

}
