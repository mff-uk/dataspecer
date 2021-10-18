import {CoreResource, CoreOperation, LanguageString} from "../../core";

export class DataPsmSetHumanLabel extends CoreOperation {

  static readonly TYPE = "data-psm-action-set-human-label";

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
