import { CoreOperation, CoreOperationExecutor } from "../../../core/index.ts";
import * as Operations from "../operation/index.ts";
import { executeDataPsmSetUseKeyValueForLangString } from "./data-psm-set-use-key-value-for-lang-string.ts";

export const jsonDataPsmExecutors: CoreOperationExecutor<CoreOperation>[] = [
  CoreOperationExecutor.create(
    Operations.DataPsmSetUseKeyValueForLangString.is,
    executeDataPsmSetUseKeyValueForLangString,
    Operations.DataPsmSetUseKeyValueForLangString.TYPE
  ),
];
