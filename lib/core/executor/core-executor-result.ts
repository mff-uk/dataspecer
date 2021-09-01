import {CoreResource, CoreTyped} from "../core-resource";

/**
 * Instance of this class must be returned by all operation executors.
 * As executor and store should live in the same memory space this class
 * is not designed to be serialized in any way.
 */
export interface CoreExecutorResult {

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

  /**
   * This field can be used to return operation specific result. The
   * properties are merged to the operation result returned by the
   * CoreResourceWriter.
   */
  operationResult: CoreTyped | null;

}

export type CreateNewIdentifier = (resourceType: string) => string;

export function createErrorOperationResult(
  message: string,
): CoreExecutorResult {
  return {
    "created": {},
    "changed": {},
    "deleted": [],
    "failed": true,
    "message": message,
    "operationResult": null,
  };
}

export function createSuccessOperationResult(
  created: CoreResource[], changed: CoreResource[], deleted: string[] = [],
  operationProperties: CoreTyped | null = null,
): CoreExecutorResult {
  const createdMap = {};
  created.forEach(resource => createdMap[resource.iri] = resource);
  const changedMap = {};
  changed.forEach(resource => changedMap[resource.iri] = resource);
  return {
    "created": createdMap,
    "changed": changedMap,
    "deleted": deleted,
    "failed": false,
    "message": null,
    "operationResult": operationProperties,
  };
}
