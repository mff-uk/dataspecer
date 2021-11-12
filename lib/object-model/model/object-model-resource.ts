/**
 * Base class for each entity, even for schema, in the object model.
 */
import {LanguageString} from "../../core";


export class ObjectModelResource {

  /**
   * The cim level is optional as the pim level may not have an interpretation.
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
   * Any resource have have additional set of metadata that
   * are used by a specific algorithm. An example are additional fields
   * generated as a part of the documentation.
   */
  metadata: {[key:string]: unknown} = {};

}

