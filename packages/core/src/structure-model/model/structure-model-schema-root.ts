import {StructureModelClass} from "./structure-model-class";

/**
 * Root of the data-psm tree in structure model.
 */
export class StructureModelSchemaRoot {
  /**
   * Data PSM iri of the root entity. Either DataPsmClass or DataPsmOr.
   */
  psmIri: string | null = null;

  /**
   * Classes that are roots of the given data-psm tree. The list represents OR
   * between those classes, hence formally "OR" is the root (first level) of the
   * tree and the classes are on the second level.
   *
   * If the array contains only one class, then the OR may be omitted.
   */
  classes: StructureModelClass[] = [];

  /**
   * Whether the root was wrapped in OR
   */
  isInOr: boolean = false;

  /**
   * Technical label of the wrapping OR. If the OR is not wrapped, then it is empty.
   */
  orTechnicalLabel: string | null = null;

  /**
   * Label used by a computer, can be used as for example as a name of
   * a property in JSON.
   */
  technicalLabel: string | null = null;

  /**
   * Technical label of the wrapping element if collection.
   */
  collectionTechnicalLabel: string | null = null;

  /**
   * Whether to enforce collection on the root.
   */
  enforceCollection: boolean = false;

  /**
   * Cardinality of the root element
   */
  cardinalityMin: number | null = null;

  /**
   * Cardinality of the root element
   */
  cardinalityMax: number | null = null;
}
