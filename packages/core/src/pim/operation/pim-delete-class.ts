import { CoreOperation, CoreResource } from "../../core/index.ts";
import * as PIM from "../pim-vocabulary.ts";

export class PimDeleteClass extends CoreOperation {
  static readonly TYPE = PIM.DELETE_CLASS;

  pimClass: string | null = null;

  constructor() {
    super();
    this.types.push(PimDeleteClass.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimDeleteClass {
    return resource?.types.includes(PimDeleteClass.TYPE);
  }
}
