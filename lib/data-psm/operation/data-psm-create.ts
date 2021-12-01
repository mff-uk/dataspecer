import {LanguageString, CoreOperation} from "../../core";

export class DataPsmCreate extends CoreOperation {

  /**
   * IRI of the newly created object.
   */
  dataPsmNewIri: string | null = null;

  dataPsmInterpretation: string | null = null;

  dataPsmTechnicalLabel: string | null = null;

  dataPsmHumanLabel: LanguageString | null = null;

  dataPsmHumanDescription: LanguageString | null = null;

  protected constructor() {
    super();
  }

}
