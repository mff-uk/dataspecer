import { CoreOperation, CoreOperationExecutor } from "../../../core";
import * as Operations from "../operation";
import { executeDataPsmSetIsXmlAttribute } from "./data-psm-set-is-xml-attribute";
import { executeDataPsmSetNamespaceXmlExtension } from "./data-psm-set-namespace-executor-xml-extension";
import { executeDataPsmSetXmlSkipRootElement } from "./data-psm-set-xml-skip-root-element";

export const xmlDataPsmExecutors: CoreOperationExecutor<CoreOperation>[] = [
  CoreOperationExecutor.create(
    Operations.DataPsmSetIsXmlAttribute.is,
    executeDataPsmSetIsXmlAttribute,
    Operations.DataPsmSetIsXmlAttribute.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmSetNamespaceXmlExtension.is,
    executeDataPsmSetNamespaceXmlExtension,
    Operations.DataPsmSetNamespaceXmlExtension.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmSetXmlSkipRootElement.is,
    executeDataPsmSetXmlSkipRootElement,
    Operations.DataPsmSetXmlSkipRootElement.TYPE
  ),
];
