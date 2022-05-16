import {CoreOperation, CoreOperationExecutor} from "../core";
import {baseDataPsmExecutors} from "./executor";
import {xmlDataPsmExecutors} from "./xml-extension/executor/xml-data-psm-executor";

export const dataPsmExecutors: CoreOperationExecutor<CoreOperation>[] = [
  ...baseDataPsmExecutors,
  ...xmlDataPsmExecutors,
]
