export class XmlSchema {
  targetNamespace: string;
  elements: XmlSchemaElement[];
}

export class XmlSchemaElement {
  elementName: string;
  type: XmlSchemaType;
}

export class XmlSchemaType {
  name: string | undefined;
  complexDefinition: XmlSchemaComplexType | undefined;
  simpleDefinition: XmlSchemaSimpleType | undefined;
}

export class XmlSchemaComplexType {
  mixed: boolean;
  xsType: string;
  contents: XmlSchemaComplexContent[];
}

export class XmlSchemaSimpleType {
  xsType: string;
  contents: string[];
}

// copied from object-model
interface Interval {
  min: number;
  max?: number;
}

export class XmlSchemaComplexContent {
  element: XmlSchemaElement | undefined;
  complexType: XmlSchemaComplexType | undefined;
  cardinality: Interval | undefined;
}
