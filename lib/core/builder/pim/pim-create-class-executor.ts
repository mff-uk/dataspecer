import {ResourceMap, SpecificActionExecutorApi} from "../action-executor";
import {CoreAction} from "../../action/core-action";
import {PimCreateClass} from "../../action/pim"

export class PimCreateClassExecutor implements SpecificActionExecutorApi {

  canExecute(action: CoreAction): boolean {
    return PimCreateClass.;
  }

  execute(resources: ResourceMap, action: CoreAction): Promise<ResourceMap> {
    return Promise.resolve(undefined);
  }

}