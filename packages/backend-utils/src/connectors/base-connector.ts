/**
 * Base connector provides a basic set of core asynchronous methods for basic CRUD operations on backend service.
 */
export interface ResourceModel {
  /**
   * Returns basic information about a resource by its ID.
   * Resource may be a package or a model.
   * Each resource may have name, description, type and other metadata that are recognized in the Dataspecer ecosystem.
   */
  getResource(id: string): Promise<any>;
}

export interface ModelModel {
  deleteModel(id: string): Promise<void>;
}

/**
 * This is an interface tailored for the structure editor that provides backend operations.
 */
export interface StructureEditorOperationWrapper {

}