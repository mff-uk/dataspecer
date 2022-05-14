import {LanguageString} from "../../../core";
import {StructureModelProperty} from "./structure-model-property";

export class StructureModelClass {
  /**
   * The cim level is optional as pim or data-psm level may not have an
   * interpretation.
   */
  cimIri: string | null = null;

  /**
   * The pim level is optional is data-psm level may not have an interpretation.
   */
  pimIri: string | null = null;

  /**
   * The psm level entity.
   */
  psmIri: string | null = null;

  /**
   * Label used by a computer, can be used as for example as a name of
   * a property in JSON.
   */
  technicalLabel: string | null = null;

  /**
   * Label visible to a human reader.
   */
  humanLabel: LanguageString | null = null;

  /**
   * Description visible to a human reader.
   */
  humanDescription: LanguageString | null = null;

  /**
   * Class can extend other classes, the properties of other classes
   * are not included in this class.
   */
  extends: StructureModelClass[] = [];

  /**
   * Properties declared on this class directly. The list is ordered.
   */
  properties: StructureModelProperty[] = [];

  /**
   * URL of a schema the class was loaded from.
   */
  structureSchema: string | null = null;

  /**
   * Specification this class was loaded from.
   */
  specification: string | null = null;

  /**
   * True if class represents a codelist.
   */
  isCodelist = false;

  /**
   * If class represents codelist this property holds URLs of the datasets
   * with the codelists.
   */
  codelistUrl: string[] = [];
}
