import { CoreOperation, CoreOperationExecutor } from "../../../core";
import * as Operations from "../operation";
import {executeDataPsmSetNamespaceXmlExtension} from "./data-psm-set-namespace-executor-xml-extension";

export const xmlDataPsmExecutors: CoreOperationExecutor<CoreOperation>[] = [
  CoreOperationExecutor.create(
    Operations.DataPsmSetNamespaceXmlExtension.is,
    executeDataPsmSetNamespaceXmlExtension,
    Operations.DataPsmSetNamespaceXmlExtension.TYPE
  ),
];
