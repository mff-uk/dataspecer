import {CoreResource, CoreOperation, LanguageString} from "../../core";

export class DataPsmSetHumanDescription extends CoreOperation {

  static readonly TYPE = "data-psm-action-set-human-description";

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
