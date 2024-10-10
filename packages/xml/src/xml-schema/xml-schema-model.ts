import { StructureModel } from "@dataspecer/core/structure-model/model/structure-model";
import { QName } from "../conventions";
import { LanguageString } from "@dataspecer/core/core/core-resource";

/**
 * Represents an xs:schema definition.
 */
export class XmlSchema {
  /**
   * The target namespace IRI, if used.
   */
  targetNamespace: string | null;

  /**
   * The target namespace prefix, if used.
   */
  targetNamespacePrefix: string | null;

  /**
   * True if the schema uses language-tagged strings.
   */
  defineLangString: boolean;

  /**
   * The array of import declarations for external schemas.
   * (If the namespace is the same as the target namespace, it is an include.)
   */
  imports: XmlSchemaImportDeclaration[];

  /**
   * The array of defined types.
   */
  types: XmlSchemaType[];

  /**
   * The array of defined groups.
   */
  groups: XmlSchemaGroupDefinition[];

  /**
   * The array of root elements.
   */
  elements: XmlSchemaElement[];

  /**
   * Location of XML file containing shared things for XML.
   */
  commonXmlSchemaLocation: string;
}

/**
 * Represents an import/include declaration to an artifact.
 */
export class XmlSchemaImportDeclaration {
  /**
   * The namespace prefix used by the schema.
   */
  prefix: string | null;

  /**
   * The namespace IRI used by the schema.
   */
  namespace: string | null;

  /**
   * The location of the schema file.
   */
  schemaLocation: string;

  model: StructureModel | null;
}

/**
 * Represents anything that can be provided with an annotation.
 */
export class XmlSchemaAnnotated {
  /**
   * The annotation of the object.
   */
  annotation: XmlSchemaAnnotation | null;
}

/**
 * Represents an annotation of an XML Schema object.
 */
export class XmlSchemaAnnotation {
  /**
   * The value of the sawsdl:modelReference attribute.
   */
  modelReference: string | null;

  /**
   * The title of the annotation for non-technical use.
   */
  metaTitle: LanguageString | null;

  /**
   * The description of the annotation for non-technical use.
   */
  metaDescription: LanguageString | null;
}

export interface XmlNamedEntity {
  /**
   * XML name attribute of the entity.
   */
  name: QName | null;
}

/**
 * Represents a top-level xs:group definition.
 */
export class XmlSchemaGroupDefinition implements XmlNamedEntity {
  entityType: "groupDefinition";

  /**
   * The name of the group.
   */
  name: QName | null;

  /**
   * The item which serves as the definition of the group.
   */
  definition: XmlSchemaComplexItem;
}

/**
 * Represents an xs:element definition.
 */
export class XmlSchemaElement extends XmlSchemaAnnotated implements XmlNamedEntity {
  entityType: "element";

  name: QName;

  /**
   * The type of the element.
   */
  type: XmlSchemaType | null;
}

/**
 * Represents an xs:simpleType or xs:complexType.
 */
export class XmlSchemaType extends XmlSchemaAnnotated implements XmlNamedEntity {
  entityType: "type";

  /**
   * The name of the type, or null if the type is inline.
   */
  name: QName | null;
}

/**
 * Represents an xs:complexType.
 */
export class XmlSchemaComplexType extends XmlSchemaType {
  /**
   * The definition of xs:complexType.
   */
  complexDefinition: XmlSchemaComplexItem;

  /**
   * The value of the mixed attribute.
   */
  mixed: boolean;

  /**
   * The value of the abstract attribute.
   */
  abstract: boolean;
}

/**
 * Represents an xs:simpleType.
 */
export class XmlSchemaSimpleType extends XmlSchemaType {
  /**
   * The definition of xs:simpleType.
   */
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
  /**
   * The name of the item's type, in the xs: namespace.
   */
  xsType: string;
}

/**
 * Represents an item in an xs:complexType that is a container of other items.
 */
export class XmlSchemaComplexContainer extends XmlSchemaComplexItem {
  /**
   * The contents of the item.
   */
  contents: XmlSchemaComplexContent[];
}

/**
 * Represents an xs:sequence element in an xs:complexType.
 */
export class XmlSchemaComplexSequence extends XmlSchemaComplexContainer {
  declare xsType: "sequence";
}

/**
 * Represents an xs:choice element in an xs:complexType.
 */
export class XmlSchemaComplexChoice extends XmlSchemaComplexContainer {
  declare xsType: "choice";
}

/**
 * Represents an xs:all element in an xs:complexType.
 */
export class XmlSchemaComplexAll extends XmlSchemaComplexContainer {
  declare xsType: "all";
}

/**
 * Represents an xs:group element in an xs:complexType.
 */
export class XmlSchemaComplexGroup extends XmlSchemaComplexItem {
  declare xsType: "group";

  name: QName;

  /**
   * In case this group is a reference to group from another schema, this is the reference.
   * Structure model ID
   */
  referencesStructure: string | null;
}

/**
 * Represents an xs:extension element in an xs:complexType.
 */
export class XmlSchemaComplexExtension extends XmlSchemaComplexContainer {
  declare xsType: "extension";

  /**
   * The name of the base type.
   */
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
  /**
   * The name of the item's type, in the xs: namespace.
   */
  xsType: string;

  /**
   * The contents of the type, as a list of {@link QName}s.
   */
  contents: QName[];
}

export class XmlSchemaSimpleItemRestriction extends XmlSchemaSimpleItem {
  declare xsType: "restriction";

  base: QName;

  pattern: string | null;
}

export function xmlSchemaSimpleTypeDefinitionIsRestriction(
  typeDefinition: XmlSchemaSimpleItem
): typeDefinition is XmlSchemaSimpleItemRestriction {
  return typeDefinition.xsType === "restriction";
}

/**
 * Represents an individual item inside a container item.
 */
export class XmlSchemaComplexContent {
  /**
   * The minimum cardinality of the item.
   */
  cardinalityMin: number;

  /**
   * The maximum cardinality of the item.
   */
  cardinalityMax: number | null;
}

/**
 * Represents a concrete xs:element inside a container item.
 */
export class XmlSchemaComplexContentElement extends XmlSchemaComplexContent {
  /**
   * The element represented by this item.
   */
  element: XmlSchemaElement;
}

/**
 * Represents a model item inside a container item.
 */
export class XmlSchemaComplexContentItem extends XmlSchemaComplexContent {
  /**
   * The model item represented by this item.
   */
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
