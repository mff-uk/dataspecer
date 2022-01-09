import {CoreResource, CoreOperation, LanguageString} from "../../core";
import * as PIM from "../pim-vocabulary";
import {SET_CLASS_CODELIST} from "../pim-vocabulary";

export class PimSetClassCodelist extends CoreOperation {

  static readonly TYPE = PIM.SET_CLASS_CODELIST;

  pimClass: string | null = null;

  pimIsCodeList: boolean = false;

  pimCodelistUrl: string[] = [];

  constructor() {
    super();
    this.types.push(PimSetClassCodelist.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimSetClassCodelist {
    return resource?.types.includes(PimSetClassCodelist.TYPE);
  }

}
