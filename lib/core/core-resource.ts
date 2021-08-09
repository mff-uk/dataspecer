/**
 * Allow for single value in each language. It is not possible to have
 * multiple values for a single language.
 */
export type LanguageString = Record<string, string>;

/**
 * Define the abstract core resource for the model, this interface shall be
 * used as a base class for every other core entity/object.
 */
export interface CoreResource {

  /**
   * In order to allow identification of all resources they must all use
   * named nodes. Blank nodes are not allowed. This property may
   * not be set for new objects.
   */
  iri?: string;

  /**
   * Types used by core model. Single resource can be of multiple
   * application types like PimClass, PimAttribute, etc..
   */
  types: string[];

}

export function createEmptyCoreResource(iri?: string) {
  return {
    "iri": iri,
    "types": [],
  };
}
