export class XmlSchema {
  targetNamespace: string;
  elements: XmlSchemaElement[] = [];
}

export class XmlSchemaElement {
  elementName: string;
  type: XmlSchemaType = new XmlSchemaType();
}

export class XmlSchemaType {
  name?: string;
  complexDefinition?: XmlSchemaComplexType;
  simpleDefinition?: XmlSchemaSimpleType;
}

export class XmlSchemaComplexType {
  mixed: boolean = false;
  xsType: string;
  contents: XmlSchemaComplexContent[];
}

export class XmlSchemaSimpleType {
  xsType: string;
  contents: string[];
}

interface Interval {
  min: number;
  max?: number;
}

export class XmlSchemaComplexContent {
  element?: XmlSchemaElement;
  complexType?: XmlSchemaComplexType;
  cardinality?: Interval;
}
