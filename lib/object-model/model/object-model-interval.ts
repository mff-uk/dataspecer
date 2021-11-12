/**
 * Represents an interval, i.e. cardinality.
 */
export class ObjectModelInterval {

  min: number = 0;

  /**
   * If not set there is no upper bound.
   */
  max: number | null = null;

}
