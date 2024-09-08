
/**
 * This interface captures requirements on an object based on the BackendPackageService.
 * @deprecated
 */
export interface LegacyModel {

  /**
   * @deprecated Use getIdentifier instead.
   * @returns Model identifier.
   */
  getId(): string;

  /**
   * @deprecated Use SerializableModel instead.
   * @returns JSON representation of model content to be send to backend.
   */
  serializeModel() : object;

  /**
   * @deprecated Use factory instead.
   * Replace model content with value loaded from given JSON representation of the model.
   * @param value
   */
  deserializeModel(value: object): void;

}
