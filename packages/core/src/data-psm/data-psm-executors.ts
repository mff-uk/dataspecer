import { CoreOperation, CoreOperationExecutor } from "../core/index.ts";
import { baseDataPsmExecutors } from "./executor/index.ts";
import { jsonDataPsmExecutors } from "./json-extension/executor/xml-data-psm-executor.ts";
import { xmlDataPsmExecutors } from "./xml-extension/executor/xml-data-psm-executor.ts";

export const dataPsmExecutors: CoreOperationExecutor<CoreOperation>[] = [
  ...baseDataPsmExecutors,
  ...xmlDataPsmExecutors,
  ...jsonDataPsmExecutors,
]
