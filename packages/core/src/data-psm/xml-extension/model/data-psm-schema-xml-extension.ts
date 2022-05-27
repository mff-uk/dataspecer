import {DataPsmSchema} from "../../model";
import {XML_EXTENSION} from "../vocabulary";

class XmlSchemaExtension {
  namespace: string | null = null;
  namespacePrefix: string | null = null;
  xsdExtractRootGroup: boolean | null = null;
  xsdExtractRootType: boolean | null = null;
  xsdExtractPropertyGroup: boolean | null = null;
  xsdExtractPropertyType: boolean | null = null;
}

export class DataPsmSchemaXmlExtension extends DataPsmSchema {
  extensions?: {
    string: object;
    [XML_EXTENSION]?: Partial<XmlSchemaExtension>
  }

  static getExtensionData(schema: DataPsmSchemaXmlExtension): XmlSchemaExtension {
    const data = new XmlSchemaExtension();
    Object.assign(data, schema?.extensions?.[XML_EXTENSION]);
    return data;
  }
}
