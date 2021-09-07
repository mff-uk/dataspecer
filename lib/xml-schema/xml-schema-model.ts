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
}

export class XmlSchemaComplexType extends XmlSchemaType {
  complexDefinition: XmlSchemaComplexTypeDefinition;
}

export class XmlSchemaSimpleType extends XmlSchemaType {
  simpleDefinition: XmlSchemaSimpleTypeDefinition;
}

export function xmlSchemaTypeIsComplex(type: XmlSchemaType): type is XmlSchemaComplexType {
  return (type as XmlSchemaComplexType).complexDefinition !== undefined;
}

export function xmlSchemaTypeIsSimple(type: XmlSchemaType): type is XmlSchemaSimpleType {
  return (type as XmlSchemaSimpleType).simpleDefinition !== undefined;
}

export class XmlSchemaComplexTypeDefinition {
  mixed: boolean;
  xsType: string;
  contents: XmlSchemaComplexContent[];
}

export class XmlSchemaSimpleTypeDefinition {
  xsType: string;
  contents: string[];
}

// copied from object-model
interface Interval {
  min: number;
  max?: number;
}

export class XmlSchemaComplexContent {
  cardinality: Interval | undefined;
}

export class XmlSchemaComplexContentElement extends XmlSchemaComplexContent {
  element: XmlSchemaElement;
}

export class XmlSchemaComplexContentType extends XmlSchemaComplexContent {
  complexType: XmlSchemaComplexTypeDefinition ;
}

export function xmlSchemaComplexContentIsElement(content: XmlSchemaComplexContent): content is XmlSchemaComplexContentElement {
  return (content as XmlSchemaComplexContentElement).element !== undefined;
}

export function xmlSchemaComplexContentIsType(content: XmlSchemaComplexContent): content is XmlSchemaComplexContentType {
  return (content as XmlSchemaComplexContentType).complexType !== undefined;
}
