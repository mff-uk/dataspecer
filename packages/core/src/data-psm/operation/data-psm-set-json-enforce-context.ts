import { CoreOperation, CoreResource } from "../../core/index.ts";
import { SET_JSON_ENFORCE_CONTEXT } from "../data-psm-vocabulary.ts";

export class DataPsmSetJsonEnforceContext extends CoreOperation {
  static readonly TYPE = SET_JSON_ENFORCE_CONTEXT;

  dataPsmEntity: string | null = null;
  jsonEnforceContext?: "no" | "as-is" | "with-extensions";

  constructor() {
    super();
    this.types.push(DataPsmSetJsonEnforceContext.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmSetJsonEnforceContext {
    return resource?.types.includes(DataPsmSetJsonEnforceContext.TYPE);
  }
}
