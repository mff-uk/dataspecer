import {CoreOperation, CoreResource} from "../../../core";
import {SET_IS_XML_ATTRIBUTE} from "../vocabulary";

export class DataPsmSetIsXmlAttribute extends CoreOperation {
  static readonly TYPE = SET_IS_XML_ATTRIBUTE;

  dataPsmProperty: string | null = null;

  isAttribute: boolean = true;

  constructor() {
    super();
    this.types.push(DataPsmSetIsXmlAttribute.TYPE);
  }

  static is(
    resource: CoreResource | null
  ): resource is DataPsmSetIsXmlAttribute {
    return resource?.types.includes(DataPsmSetIsXmlAttribute.TYPE);
  }
}
