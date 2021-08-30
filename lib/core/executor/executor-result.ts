import {CoreResource} from "../core-resource";

/**
 * Instance of this class must be returned by all operation executors.
 */
export interface ExecutorResult {

  /**
   * Map of created resources.
   */
  created: { [iri: string]: CoreResource };

  /**
   * Map of changed resources.
   */
  changed: { [iri: string]: CoreResource };

  /**
   * List of resources that should be deleted.
   */
  deleted: string[];

  /**
   * Operations should not throw an exception, instead they should
   * return this object with failed set to true and provide an error message.
   */
  failed: boolean;

  /**
   * Error message in case of failure, otherwise an
   * optional message for the user.
   */
  message: string | null;

}

export type CreateNewIdentifier = (resourceType: string) => string;

export function createErrorOperationResult(
  message: string
): ExecutorResult {
  return {
    "created": {},
    "changed": {},
    "deleted": [],
    "failed": true,
    "message": message,
  };
}

export function createEmptySuccessOperationResult(): ExecutorResult {
  return {
    "created": {},
    "changed": {},
    "deleted": [],
    "failed": false,
    "message": null,
  };
}

export function createSuccessOperationResult(
  created: CoreResource[], changed: CoreResource[], deleted: string[] = [],
): ExecutorResult {
  const createdMap = {};
  changed.forEach(resource => createdMap[resource.iri] = resource);
  const changedMap = {};
  changed.forEach(resource => changedMap[resource.iri] = resource);
  return {
    "created": createdMap,
    "changed": changedMap,
    "deleted": deleted,
    "failed": false,
    "message": null,
  };
}
