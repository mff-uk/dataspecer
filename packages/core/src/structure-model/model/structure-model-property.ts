import { LanguageString } from "../../core";
import { StructureModelType } from "./structure-model-type";

export class StructureModelProperty {
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

  cardinalityMin: number | null = null;

  cardinalityMax: number | null = null;

  dataTypes: StructureModelType[] = [];

  /**
   * If true the output is not materialized.
   */
  dematerialize: boolean | null = null;

  /**
   * If this property is not on it's PSM owner class, this store
   * path from the original location to the current owner. This can happen
   * for by dematerialization. The first item is the original owner class.
   */
  pathToOrigin: {
    /**
     * PSM property from current class.
     */
    psmProperty: string;

    /**
     * IRI of PSM class obtained by resolving the property.
     */
    psmTargetClass: string;
  }[] = [];
}
