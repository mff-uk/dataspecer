import {LanguageString} from "../../core";
import {StructureModelType} from "./structure-model-type";

export class StructureModelProperty {

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
  isNotMaterialized: boolean | null = null;

}