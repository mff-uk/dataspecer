import { CoreOperation, CoreOperationExecutor } from "../../../core";
import * as Operations from "../operation";
import { executeDataPsmSetUseKeyValueForLangString } from "./data-psm-set-use-key-value-for-lang-string";

export const jsonDataPsmExecutors: CoreOperationExecutor<CoreOperation>[] = [
  CoreOperationExecutor.create(
    Operations.DataPsmSetUseKeyValueForLangString.is,
    executeDataPsmSetUseKeyValueForLangString,
    Operations.DataPsmSetUseKeyValueForLangString.TYPE
  ),
];
