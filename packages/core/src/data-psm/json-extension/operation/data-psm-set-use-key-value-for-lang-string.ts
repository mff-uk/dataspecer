import {CoreOperation, CoreResource} from "../../../core/index.ts";
import {SET_USE_KEY_VALUE_FOR_LANG_STRING} from "../vocabulary.ts";

export class DataPsmSetUseKeyValueForLangString extends CoreOperation {
  static readonly TYPE = SET_USE_KEY_VALUE_FOR_LANG_STRING;

  dataPsmProperty: string | null = null;

  useKeyValueForLangString: boolean = false;

  constructor() {
    super();
    this.types.push(DataPsmSetUseKeyValueForLangString.TYPE);
  }

  static is(
    resource: CoreResource | null
  ): resource is DataPsmSetUseKeyValueForLangString {
    return resource?.types.includes(DataPsmSetUseKeyValueForLangString.TYPE);
  }
}
