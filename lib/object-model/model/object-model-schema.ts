/**
 * Schema is the root object that is used to identify a collection of classes.
 * We can see schema as a diagram that contains the class definitions.
 */
import {LanguageString} from "../../core";
import {ObjectModelClass} from "./object-model-class";

export class ObjectModelSchema {

  /**
   * PSM level entity IRI. The schema exists only on PSM level thus
   * there are no IRS of PIM or CIM.
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
   * Root classes as specified by the data-psm schema.
   */
  roots: ObjectModelClass[] = [];

  /**
   * All classes in the schema including the root classes.
   */
  classes: ObjectModelClass[] = [];

}