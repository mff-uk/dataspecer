import {CoreOperation, CoreResource} from "../../core";

export class DataPsmSetDatatype extends CoreOperation {

  static readonly TYPE = "data-psm-action-set-datatype";

  dataPsmAttribute: string | null = null;

  dataPsmDatatype: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetDatatype.TYPE);
  }

  static is(
    resource: CoreResource | null,
  ): resource is DataPsmSetDatatype {
    return resource?.types.includes(DataPsmSetDatatype.TYPE);
  }

}
