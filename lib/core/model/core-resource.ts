/**
 * Allow for single value in each language. It is not possible to have
 * multiple values for a single language.
 */
export type LanguageString = Record<string, string>;

/**
 * Define the abstract core resource for the model, this interface shall be
 * used as a base class for every other core entity/object.
 */
export class CoreResource {

  /**
   * In order to allow identification of all resources they must all use
   * named nodes. Blank nodes are not allowed.
   */
  iri: string;

  /**
   * Types used by core model. Single resource can be of multiple
   * application types like PimClass, PimAttribute, etc..
   */
  types: string[] = [];

  constructor(iri: string) {
    this.iri = iri;
  }

}
