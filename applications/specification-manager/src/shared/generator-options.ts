/**
 * Additional options describing how {@link DataSpecification}s artifacts should
 * be generated.
 */
export interface GeneratorOptions {
  /**
   * This field maps data structures to the list of IRI of schemas, that should
   * be generated for given data structure (denoted by iri in the key).
   *
   * @example {"my-data-structure": ["xml", "json"]}
   */
  requiredDataStructureSchemas: Record<string, string[]>;
}
