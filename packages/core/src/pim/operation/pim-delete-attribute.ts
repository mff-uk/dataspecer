import { CoreOperation, CoreResource } from "../../core/index.ts";
import * as PIM from "../pim-vocabulary.ts";

export class PimDeleteAttribute extends CoreOperation {
  static readonly TYPE = PIM.DELETE_ATTRIBUTE;

  pimAttribute: string | null = null;

  constructor() {
    super();
    this.types.push(PimDeleteAttribute.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimDeleteAttribute {
    return resource?.types.includes(PimDeleteAttribute.TYPE);
  }
}
