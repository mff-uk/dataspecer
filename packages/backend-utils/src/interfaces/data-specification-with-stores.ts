import {DataSpecification} from "@dataspecer/core/data-specification/model";
import {StoreDescriptor} from "../store-descriptor/index.ts";

/**
 * Extends data specification structure with store descriptors.
 */
export interface DataSpecificationWithStores extends DataSpecification {
  /**
   * Store descriptors for PIM schema.
   *
   * Stores from imported specification are not included and must be included
   * manually.
   */
  pimStores: StoreDescriptor[];

  /**
   * Descriptors needed for specific PSM schemas.
   *
   * Stores having PIM and stores from imported specifications are not included
   * and must be included manually.
   */
  psmStores: { [psmIri: string]: StoreDescriptor[] };
}
