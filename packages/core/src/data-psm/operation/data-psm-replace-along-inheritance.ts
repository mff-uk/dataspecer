import { CoreOperation, CoreResource } from "../../core";
import * as PSM from "../data-psm-vocabulary";

/**
 * Replaces data PSM class with another class that is ancestor or descendant of
 * the original class. Preserves the original class associations and attributes.
 *
 * Operation does not remove the original class.
 */
export class DataPsmReplaceAlongInheritance extends CoreOperation {
  static readonly TYPE = PSM.REPLACE_ALONG_INHERITANCE;

  dataPsmOriginalClass: string | null = null;

  dataPsmReplacingClass: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmReplaceAlongInheritance.TYPE);
  }

  static is(resource: CoreResource | null):
    resource is DataPsmReplaceAlongInheritance {
    return resource?.types.includes(DataPsmReplaceAlongInheritance.TYPE);
  }
}
