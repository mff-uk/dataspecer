import * as NamingConventions from "./naming-styles";

export type NameToIriStrategy = (name: string) => string;

/**
 * This configuration is not provided via the React context as we
 * do not support change witout applicaiton reload.
 *
 * The idea is to restrict use of context for things we do not
 * need to watch for.
 */
export interface Configuration {

  /**
   * When primary language is missing languages
   * in this list are used.
   *
   * When there is no language from this list we
   * we use anything.
   */
  languagePreferences: string[];

  /**
   * Given a name creates IRI.
   */
  nameToIri: NameToIriStrategy;

  /**
   * Specialization of nameToIri used for classes.
   */
  nameToClassIri: NameToIriStrategy;

  /**
   * When true identifiers should not be visible to the user.
   */
  hideIdentifier: boolean;

  /**
   * If true cardinalities for attributes and associations are
   * not visible to the user.
   * In addition they are also set to null for new entities.
   */
  hideRelationCardinality: boolean;


  /**
   * Value for reactflow's snap grid - x coordinate
   */
  xSnapGrid: number;
  /**
   * Value for reactflow's snap grid - y coordinate
   */
  ySnapGrid: number;

  /**
   * Specifies the distance after which should the alignment line disappear (should be multiple of xSnapGrid) - x coordinate
   */
  alignmentXSnapGrid: number;
  /**
   * Specifies the distance after which should the alignment line disappear (should be multiple of ySnapGrid) - y coordinate
   */
  alignmentYSnapGrid: number;

}

/**
 * Read comment for the Configuration interface above!
 */
export const configuration = (): Configuration => {
  const xSnapGrid = 10;
  const ySnapGrid = 10;
  const alignmentXSnapGrid = xSnapGrid * 2;
  const alignmentYSnapGrid = ySnapGrid * 2;

  return {
    languagePreferences: ["en", "es", "de", "cs", "sk"],
    nameToIri: NamingConventions.lowerCamelCase,
    nameToClassIri: NamingConventions.upperCamelCase,
    hideIdentifier: true,
    hideRelationCardinality: true,

    xSnapGrid,
    ySnapGrid,
    alignmentXSnapGrid,
    alignmentYSnapGrid
  };
};
