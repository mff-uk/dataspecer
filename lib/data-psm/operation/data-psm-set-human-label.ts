import {CoreResource, CoreOperation, LanguageString} from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmSetHumanLabel extends CoreOperation {

  static readonly TYPE = PSM.SET_HUMAN_LABEL;

  dataPsmResource: string | null = null;

  dataPsmHumanLabel: LanguageString | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetHumanLabel.TYPE);
  }

  static is(
    resource: CoreResource | null,
  ): resource is DataPsmSetHumanLabel {
    return resource?.types.includes(DataPsmSetHumanLabel.TYPE);
  }

}
