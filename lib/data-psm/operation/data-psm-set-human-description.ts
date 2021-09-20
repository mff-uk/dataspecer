import {CoreResource, CoreOperation, LanguageString} from "../../core";

export class DataPsmSetHumanDescription extends CoreOperation {

  static readonly TYPE = "psm-action-update-human-description";

  dataPsmResource: string | null = null;

  dataPsmHumanDescription: LanguageString | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetHumanDescription.TYPE);
  }

  static is(
    resource: CoreResource | null,
  ): resource is DataPsmSetHumanDescription {
    return resource?.types.includes(DataPsmSetHumanDescription.TYPE);
  }

}
