import {StructureModel} from "../../structure-model/model";

/**
 * Structure model for XML schemas.
 */
export class XmlStructureModel extends StructureModel {
  namespace: string | null = null;
  namespacePrefix: string | null = null;
  xsdExtractRootGroup: boolean | null = null;
  xsdExtractRootType: boolean | null = null;
  xsdExtractPropertyGroup: boolean | null = null;
  xsdExtractPropertyType: boolean | null = null;
}
