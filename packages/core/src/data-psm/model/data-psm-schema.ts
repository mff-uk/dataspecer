import { CoreResource, LanguageString } from "../../core";
import * as PSM from "../data-psm-vocabulary";

/**
 * Originally the schema point only to root classes. The rest of the diagram
 * has been loaded by resolving the referenced entities.
 *
 * This mean that each class must be either a root class or added to
 * diagram as an association. This is not possible as in order to create
 * an association the class must already exists. So before adding the
 * association the class would need to be root class, and after the association
 * is created the class would be removed from the root class list.
 * Such approach would make it difficult to manage the schema.
 *
 * A solution is to introduce list of all parts. This list contains
 * all resources in the schema. A class can then be optionally added
 * to the list of root classes.
 */
export class DataPsmSchema extends CoreResource {
  private static readonly TYPE = PSM.SCHEMA;

  /**
   * Label used in human readable documents as a name for this resource.
   */
  dataPsmHumanLabel: LanguageString | null = null;

  /**
   * Description, longer plain text, shown in human readable documents
   * as a description for this resource.
   */
  dataPsmHumanDescription: LanguageString | null = null;

  /**
   * Label used by file formats, may represent a name of a property
   * in JSON or tag name in XML.
   */
  dataPsmTechnicalLabel: string | null = null;

  dataPsmRoots: string[] = [];

  dataPsmParts: string[] = [];

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(DataPsmSchema.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmSchema {
    return resource?.types.includes(DataPsmSchema.TYPE);
  }
}
