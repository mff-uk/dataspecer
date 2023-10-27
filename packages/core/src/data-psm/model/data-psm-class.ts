import { CoreResource } from "../../core";
import { DataPsmResource } from "./data-psm-resource";
import * as PSM from "../data-psm-vocabulary";

/**
 * Class on the PSM level points to all its parts, e.g.: association ends,
 * attributes, choices, etc.. In addition a class may extend another class,
 * by doing so this class automatically and implicitly has inherit all the
 * other class attributes, choices, etc..
 */
export class DataPsmClass extends DataPsmResource {
  private static readonly TYPE = PSM.CLASS;

  dataPsmExtends: string[] = [];

  dataPsmParts: string[] = [];

  dataPsmIsClosed: boolean | null = null;

  /**
   * Key of property representing ID of the entity.
   * If set to null, the property won't be used.
   * If set to undefined, the default value will be used.
   */
  jsonIdKeyAlias?: string | null | undefined;

  /**
   * Whether the property @id is required.
   * If set to undefined, the default value will be used.
   */
  jsonIdRequired?: boolean | undefined;

  /**
   * Key of property representing the type of the entity.
   * If set to null, the property won't be used.
   * If set to undefined, the default value will be used.
   */
  jsonTypeKeyAlias?: string | null | undefined;

  /**
   * Whether the property @type is required.
   * If set to undefined, the default value will be used.
   */
  jsonTypeRequired?: boolean | undefined;

  /**
   * Whether instances of this class may/must/must not have identity, for example IRI.
   * If set to undefined, the default value will be used which is "ALWAYS" currently.
   */
  instancesHaveIdentity: "ALWAYS" | "NEVER" | "OPTIONAL" | undefined = undefined;

  /**
   * Require explicit instance typing. For example as @type property in JSON-LD.
   * If set to undefined, the default value will be used which is "ALWAYS" currently.
   */
  instancesSpecifyTypes: "ALWAYS" | "NEVER" | "OPTIONAL" | undefined = undefined;

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(DataPsmClass.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmClass {
    return resource?.types.includes(DataPsmClass.TYPE);
  }
}
