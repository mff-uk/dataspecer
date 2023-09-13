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

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(DataPsmClass.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmClass {
    return resource?.types.includes(DataPsmClass.TYPE);
  }
}
