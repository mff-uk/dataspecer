import {assert} from "../assert";
import {CoreAction} from "../action/core-action";
import {CoreResource} from "../model";
import {} from "../action/pim";
import {} from "../action/psm";

export type ResourceMap = { [iri: string]: CoreResource };

export interface SpecificActionExecutorApi {

  canExecute(action: CoreAction): boolean;

  /**
   * Return map with changed resources. This function does not change
   * the input resource map.
   */
  execute(resources: ResourceMap, action: CoreAction): Promise<ResourceMap>;

}

export interface EventExecutorResult {

  resources: ResourceMap;

  /**
   * IRIs of changed object in resources map.
   */
  changed: string [];

}

/**
 * Execute given action using matching executor, every action must by
 * executed by exactly one executor.
 */
export class ActionExecutor {

  readonly executors: SpecificActionExecutorApi[];

  protected constructor(executors: SpecificActionExecutorApi[]) {
    this.executors = executors;
  }

  public async execute(
    resources: ResourceMap, action: CoreAction
  ): Promise<EventExecutorResult> {
    let changedResources: ResourceMap;
    let resultIsReady = false;
    for (const executor of this.executors) {
      if (!executor.canExecute(action)) {
        continue;
      }
      assert(
        !resultIsReady,
        "Multiple executors can be used for a single action.");
      resultIsReady = true;
      changedResources = await executor.execute(resources, action);
    }
    assert(resultIsReady, "No executor find for given action.")
    return {
      "resources": {
        ...resources,
        ...changedResources
      },
      "changed": Object.keys(changedResources),
    };
  }

  public static create() {
    return new ActionExecutor([]);
  }

}


