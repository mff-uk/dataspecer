import { CoreResource, CoreOperation, LanguageString } from "../../core/index.ts";
import * as PSM from "../data-psm-vocabulary.ts";

export class DataPsmSetHumanDescription extends CoreOperation {
  static readonly TYPE = PSM.SET_HUMAN_DESCRIPTION;

  dataPsmResource: string | null = null;

  dataPsmHumanDescription: LanguageString | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetHumanDescription.TYPE);
  }

  static is(
    resource: CoreResource | null
  ): resource is DataPsmSetHumanDescription {
    return resource?.types.includes(DataPsmSetHumanDescription.TYPE);
  }
}
