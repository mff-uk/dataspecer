export class XmlSchema {
  targetNamespace: string;
  types: XmlSchemaComplexType[] = [];
  elements: XmlSchemaElement[] = [];
}

export class XmlSchemaElement {
  name: string;
  type: XmlSchemaType = new XmlSchemaType();
}

export class XmlSchemaType {
  name: string | undefined;
  definition: XmlSchemaComplexType | undefined;
}

export class XmlSchemaComplexType {
  mixed: boolean = false;
  type: string;
  contents: XmlSchemaElement[] | undefined;
}