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
   * Technical label of the wrapping OR. If the OR is not wrapped, then it is empty.
   */
  orTechnicalLabel: string | null = null;
}
