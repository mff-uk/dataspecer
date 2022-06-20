import { QName } from "../xml/xml-conventions";

/**
 * Represents an xs:schema definition.
 */
export class XmlSchema {
  targetNamespace: string | null;
  targetNamespacePrefix: string | null;
  defineLangString: boolean;
  imports: XmlSchemaImportDeclaration[];
  types: XmlSchemaType[];
  groups: XmlSchemaGroupDefinition[];
  elements: XmlSchemaElement[];
}

/**
 * Represents an import/include declaration to an artifact.
 */
export class XmlSchemaImportDeclaration {
  prefix: Promise<string | null>;
  namespace: Promise<string | null>;
  schemaLocation: string;
}

/**
 * Represents anything that can be provided with an annotation.
 */
export class XmlSchemaAnnotated {
  annotation: XmlSchemaAnnotation | null;
}

/**
 * Represents an annotation of an XML Schema object.
 */
export class XmlSchemaAnnotation {
  modelReference: string | null;
  documentation: string | null;
}

/**
 * Represents a top-level xs:group definition.
 */
export class XmlSchemaGroupDefinition {
  name: string | null;
  contents: XmlSchemaComplexContent[];
}

/**
 * Represents an xs:element definition.
 */
export class XmlSchemaElement extends XmlSchemaAnnotated {
  elementName: QName | Promise<QName>;
  type: XmlSchemaType | null;
}

/**
 * Represents an xs:simpleType or xs:complexType.
 */
export class XmlSchemaType extends XmlSchemaAnnotated {
  name: QName | null;
}

/**
 * Represents an xs:complexType.
 */
export class XmlSchemaComplexType extends XmlSchemaType {
  complexDefinition: XmlSchemaComplexItem;
  mixed: boolean;
  abstract: boolean;
}

/**
 * Represents an xs:simpleType.
 */
export class XmlSchemaSimpleType extends XmlSchemaType {
  simpleDefinition: XmlSchemaSimpleItem;
}

export function xmlSchemaTypeIsComplex(
  type: XmlSchemaType | null
): type is XmlSchemaComplexType {
  return type != null &&
    (type as XmlSchemaComplexType).complexDefinition !== undefined;
}

export function xmlSchemaTypeIsSimple(
  type: XmlSchemaType | null
): type is XmlSchemaSimpleType {
  return type != null &&
    (type as XmlSchemaSimpleType).simpleDefinition !== undefined;
}

/**
 * Represents an item in an xs:complexType.
 */
export class XmlSchemaComplexItem {
  xsType: string;
}

/**
 * Represents an item in an xs:complexType that is a container of other items.
 */
export class XmlSchemaComplexContainer extends XmlSchemaComplexItem {
  contents: XmlSchemaComplexContent[];
}

/**
 * Represents an xs:sequence element in an xs:complexType.
 */
export class XmlSchemaComplexSequence extends XmlSchemaComplexContainer {
  xsType: "sequence";
}

/**
 * Represents an xs:choice element in an xs:complexType.
 */
export class XmlSchemaComplexChoice extends XmlSchemaComplexContainer {
  xsType: "choice";
}

/**
 * Represents an xs:all element in an xs:complexType.
 */
export class XmlSchemaComplexAll extends XmlSchemaComplexContainer {
  xsType: "all";
}

/**
 * Represents an xs:group element in an xs:complexType.
 */
export class XmlSchemaComplexGroup extends XmlSchemaComplexItem {
  xsType: "group";
  name: QName | Promise<QName>;
}

/**
 * Represents an xs:extension element in an xs:complexType.
 */
export class XmlSchemaComplexExtension extends XmlSchemaComplexContainer {
  xsType: "extension";
  base: QName;
}

export function xmlSchemaComplexTypeDefinitionIsSequence(
  typeDefinition: XmlSchemaComplexItem
): typeDefinition is XmlSchemaComplexSequence {
  return typeDefinition.xsType === "sequence";
}

export function xmlSchemaComplexTypeDefinitionIsChoice(
  typeDefinition: XmlSchemaComplexItem
): typeDefinition is XmlSchemaComplexChoice {
  return typeDefinition.xsType === "choice";
}

export function xmlSchemaComplexTypeDefinitionIsAll(
  typeDefinition: XmlSchemaComplexItem
): typeDefinition is XmlSchemaComplexAll {
  return typeDefinition.xsType === "all";
}

export function xmlSchemaComplexTypeDefinitionIsGroup(
  typeDefinition: XmlSchemaComplexItem
): typeDefinition is XmlSchemaComplexGroup {
  return typeDefinition.xsType === "group";
}

export function xmlSchemaComplexTypeDefinitionIsExtension(
  typeDefinition: XmlSchemaComplexItem
): typeDefinition is XmlSchemaComplexExtension {
  return typeDefinition.xsType === "extension";
}

/**
 * Represents an item in an xs:simpleType.
 */
export class XmlSchemaSimpleItem {
  xsType: string;
  contents: QName[];
}

/**
 * Represents an individual item inside a container item.
 */
export class XmlSchemaComplexContent {
  cardinalityMin: number;
  cardinalityMax: number | null;
}

/**
 * Represents a concrete xs:element inside a container item.
 */
export class XmlSchemaComplexContentElement extends XmlSchemaComplexContent {
  element: XmlSchemaElement;
}

/**
 * Represents a model item inside a container item.
 */
export class XmlSchemaComplexContentItem extends XmlSchemaComplexContent {
  item: XmlSchemaComplexItem;
}

export function xmlSchemaComplexContentIsElement(
  content: XmlSchemaComplexContent
): content is XmlSchemaComplexContentElement {
  return (content as XmlSchemaComplexContentElement).element !== undefined;
}

export function xmlSchemaComplexContentIsItem(
  content: XmlSchemaComplexContent
): content is XmlSchemaComplexContentItem {
  return (content as XmlSchemaComplexContentItem).item !== undefined;
}
