import { CoreOperation, CoreOperationExecutor } from "../core";
import { baseDataPsmExecutors } from "./executor";
import { jsonDataPsmExecutors } from "./json-extension/executor/xml-data-psm-executor";
import { xmlDataPsmExecutors } from "./xml-extension/executor/xml-data-psm-executor";

export const dataPsmExecutors: CoreOperationExecutor<CoreOperation>[] = [
  ...baseDataPsmExecutors,
  ...xmlDataPsmExecutors,
  ...jsonDataPsmExecutors,
]
