
/**
 * This interface captures requirements on an object based on the BackendPackageService.
 */
export interface LegacyModel {

  /**
   * @returns Model identifier.
   */
  getId(): string;

  /**
   * @returns JSON representation of model content to be send to backend.
   */
  serializeModel() : object;

  /**
   * Replace model content with value loaded from given JSON representation of the model.
   * @param value
   */
  deserializeModel(value: object): void;

}