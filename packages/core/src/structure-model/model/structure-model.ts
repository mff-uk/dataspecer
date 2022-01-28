import {LanguageString} from "../../core";
import {StructureModelClass} from "./structure-model-class";

/**
 * Schema is the root object that is used to identify a collection of classes.
 * We can see schema as a diagram that contains the class definitions.
 */
export class StructureModel {

  /**
   * PSM level entity IRI. The schema exists only on PSM level thus
   * there are no IRS of PIM or CIM.
   */
  psmIri: string | null = null;

  /**
   * Label visible to a human reader.
   */
  humanLabel: LanguageString | null = null;

  /**
   * Description visible to a human reader.
   */
  humanDescription: LanguageString | null = null;

  technicalLabel: string | null = null;

  /**
   * Root classes as specified by the data-psm schema.
   */
  roots: string[] = [];

  /**
   * All classes in the schema including the root classes, stored
   * under PSM IRI.
   */
  classes: { [iri: string]: StructureModelClass } = {};

  /**
   * Specification this class was loaded from.
   */
  specification: string | null = null;

}
