
/**
 * A pair of a namespace prefix and a local name.
 */
export type QName = [prefix: string, localName: string];

/**
 * The QName used for an extension of xs:string that requires xml:lang.
 */
export const langStringName: QName = [null, "langString"];

/**
 * Represents an xs:schema definition.
 */
export class XmlSchema {
  targetNamespace: string | null;
  targetNamespacePrefix: string | null;
  imports: XmlImportDeclaration[];
  elements: XmlSchemaElement[];
  defineLangString: boolean;
}

/**
 * Represents an import/include declaration to an artifact.
 */
export class XmlImportDeclaration {
  prefix: string | null;
  namespace: string | null;
  schemaLocation: string;
}

/**
 * Represents an xs:element definition.
 */
export class XmlSchemaElement {
  elementName: string;
  type: XmlSchemaType;
}

/**
 * Represents an xs:simpleType or xs:complexType.
 */
export class XmlSchemaType {
  name: string | undefined;
}

/**
 * Represents an xs:complexType.
 */
export class XmlSchemaComplexType extends XmlSchemaType {
  complexDefinition: XmlSchemaComplexTypeDefinition;
}

/**
 * Represents an xs:simpleType.
 */
export class XmlSchemaSimpleType extends XmlSchemaType {
  simpleDefinition: XmlSchemaSimpleTypeDefinition;
}

export function xmlSchemaTypeIsComplex(
  type: XmlSchemaType,
): type is XmlSchemaComplexType {
  return (type as XmlSchemaComplexType).complexDefinition !== undefined;
}

export function xmlSchemaTypeIsSimple(
  type: XmlSchemaType,
): type is XmlSchemaSimpleType {
  return (type as XmlSchemaSimpleType).simpleDefinition !== undefined;
}

/**
 * Represents an element in an xs:complexType.
 */
export class XmlSchemaComplexTypeDefinition {
  mixed: boolean;
  xsType: string;
  contents: XmlSchemaComplexContent[];
}

/**
 * Represents an element in an xs:simpleType.
 */
export class XmlSchemaSimpleTypeDefinition {
  xsType: string;
  contents: QName[];
}

/**
 * Copied from object-model.
 */
interface Interval {
  min: number;
  max?: number;
}

/**
 * Represents an individual element inside an aggregate element.
 */
export class XmlSchemaComplexContent {
  cardinality: Interval | undefined;
}

/**
 * Represents a concrete xs:element inside an aggregate element.
 */
export class XmlSchemaComplexContentElement extends XmlSchemaComplexContent {
  element: XmlSchemaElement;
}

/**
 * Represents an aggregate element inside an aggregate element.
 */
export class XmlSchemaComplexContentType extends XmlSchemaComplexContent {
  complexType: XmlSchemaComplexTypeDefinition ;
}

export function xmlSchemaComplexContentIsElement(
  content: XmlSchemaComplexContent,
): content is XmlSchemaComplexContentElement {
  return (content as XmlSchemaComplexContentElement).element !== undefined;
}

export function xmlSchemaComplexContentIsType(
  content: XmlSchemaComplexContent,
): content is XmlSchemaComplexContentType {
  return (content as XmlSchemaComplexContentType).complexType !== undefined;
}
