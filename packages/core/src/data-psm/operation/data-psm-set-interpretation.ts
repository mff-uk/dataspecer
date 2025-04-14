import { CoreResource, CoreOperation } from "../../core/index.ts";
import * as PSM from "../data-psm-vocabulary.ts";

export class DataPsmSetInterpretation extends CoreOperation {
  static readonly TYPE = PSM.SET_INTERPRETATION;

  dataPsmResource: string | null = null;

  dataPsmInterpretation: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetInterpretation.TYPE);
  }

  static is(
    resource: CoreResource | null
  ): resource is DataPsmSetInterpretation {
    return resource?.types.includes(DataPsmSetInterpretation.TYPE);
  }
}
