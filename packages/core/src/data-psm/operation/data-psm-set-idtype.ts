import { CoreResource, CoreOperation } from "../../core";
import * as PSM from "../data-psm-vocabulary";

/**
 * Overrides default @id and @type settings for JSON generators
 */
export class DataPsmSetIdType extends CoreOperation {
  static readonly TYPE = PSM.SET_ID_TYPE;

  dataPsmResource: string | null = null;

  /**
   * Key of property representing ID of the entity.
   * If set to null, the property won't be used.
   * If set to undefined, the default value will be used.
   */
  jsonIdKeyAlias: string | null | undefined = undefined;

  /**
   * Whether the property @id is required.
   * If set to undefined, the default value will be used.
   */
  jsonIdRequired: boolean | undefined = undefined;

  /**
   * Key of property representing the type of the entity.
   * If set to null, the property won't be used.
   * If set to undefined, the default value will be used.
   */
  jsonTypeKeyAlias: string | null | undefined = undefined;

  /**
   * Whether the property @type is required.
   * If set to undefined, the default value will be used.
   */
  jsonTypeRequired: boolean | undefined = undefined;

  constructor() {
    super();
    this.types.push(DataPsmSetIdType.TYPE);
  }

  static is(
    resource: CoreResource | null
  ): resource is DataPsmSetIdType {
    return resource?.types.includes(DataPsmSetIdType.TYPE);
  }
}
