import {CoreOperation, CoreResource} from "../../../core/index.ts";
import {SET_SKIP_ROOT_ELEMENT} from "../vocabulary.ts";

export class DataPsmSetXmlSkipRootElement extends CoreOperation {
  static readonly TYPE = SET_SKIP_ROOT_ELEMENT;

  dataPsmSchema: string | null = null;

  skipRootElement: boolean | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetXmlSkipRootElement.TYPE);
  }

  static is(
    resource: CoreResource | null
  ): resource is DataPsmSetXmlSkipRootElement {
    return resource?.types.includes(DataPsmSetXmlSkipRootElement.TYPE);
  }
}
