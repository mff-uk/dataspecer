import {CoreResource} from "../core-resource";

export interface OperationResult {

  /**
   * Map of changed resources.
   */
  changedResources: { [iri: string]: CoreResource };

  /**
   * List of resources that should be deleted.
   */
  deletedResource: string[];

  /**
   * True if an operation failed.
   */
  failed: boolean;

  /**
   * Error message in case of failure, otherwise an
   * optional message for the user.
   */
  message: OperationMessage;

}

export type OperationMessage = string;

export type CreateNewIdentifier = (resourceType: string) => string;

export function createErrorOperationResult(
  message: OperationMessage,
): OperationResult {
  return {
    "changedResources": {},
    "deletedResource": [],
    "failed": true,
    "message": message,
  };
}

export function createEmptySuccessOperationResult(): OperationResult {
  return {
    "changedResources": {},
    "deletedResource": [],
    "failed": false,
    "message": "",
  };
}

export function createSuccessOperationResult(
  changed: CoreResource[], deleted: string[] = [],
): OperationResult {
  const resourceMap = {};
  changed.forEach(resource => resourceMap[resource.iri] = resource);
  return {
    "changedResources": resourceMap,
    "deletedResource": deleted,
    "failed": false,
    "message": "",
  };
}
