import { DataPsmResource } from "../../model/index.ts";
import { XML_EXTENSION } from "../vocabulary.ts";

class XmlPropertyExtension {
  isAttribute: boolean = false;
}

export class DataPsmXmlPropertyExtension extends DataPsmResource {
  declare extensions?: {
    string: object;
    [XML_EXTENSION]?: Partial<XmlPropertyExtension>
  }

  static getExtensionData(property: DataPsmXmlPropertyExtension): XmlPropertyExtension {
    const data = new XmlPropertyExtension();
    Object.assign(data, property?.extensions?.[XML_EXTENSION]);
    return data;
  }
}
