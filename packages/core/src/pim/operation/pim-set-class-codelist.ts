import { CoreResource, CoreOperation } from "../../core/index.ts";
import * as PIM from "../pim-vocabulary.ts";

export class PimSetClassCodelist extends CoreOperation {
  static readonly TYPE = PIM.SET_CLASS_CODELIST;

  pimClass: string | null = null;

  pimIsCodeList = false;

  pimCodelistUrl: string[] = [];

  constructor() {
    super();
    this.types.push(PimSetClassCodelist.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimSetClassCodelist {
    return resource?.types.includes(PimSetClassCodelist.TYPE);
  }
}
