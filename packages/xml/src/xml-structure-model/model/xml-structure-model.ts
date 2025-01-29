import {StructureModel} from "@dataspecer/core/structure-model/model";

/**
 * Structure model for XML schemas.
 */
export class XmlStructureModel extends StructureModel {
  namespace: string | null = null;
  namespacePrefix: string | null = null;
  skipRootElement: boolean | null = false;
}
