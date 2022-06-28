import { QName } from "../xml/xml-conventions";

/**
 * Represents an XSL transformation, used for lifting or lowering.
 */
export class XmlTransformation {
  /**
   * The target namespace IRI, if used.
   */
  targetNamespace: string | null;
  
  /**
   * The target namespace prefix, if used.
   */
  targetNamespacePrefix: string | null;

  /**
   * The map of prefixes to RDF namespaces, used for lifting.
   */
  rdfNamespaces: Record<string, string>;

  /**
   * The array of root templates, matching a particular element.
   */
  rootTemplates: XmlRootTemplate[];

  /**
   * The array of other templates with given names.
   */
  templates: XmlTemplate[];

  /**
   * The array of imports of other stylesheets.
   */
  imports: XmlTransformationImport[];
}

/**
 * Stores the locations of included templates for each generator.
 */
export class XmlTransformationImport {
  /**
   * The locations of included templates, identified by the generator IRI.
   */
  locations: Record<string, string>;
}

export class XmlTemplate {
  /**
   * The name of the template.
   */
  name: string;

  /**
   * The IRI of the RDF class represented by this template.
   */
  classIri: string;

  /**
   * The array of matches for each used property of the class.
   */
  propertyMatches: XmlMatch[];

  /**
   * True if the template is imported from another stylesheet.
   */
  imported: boolean;
}

/**
 * A root template, matching a specific element and calling its class's
 * template.
 */
export class XmlRootTemplate {
  /**
   * The IRI of the RDF class represented by this template.
   */
  classIri: string;

  /**
   * The name of the element in XML.
   */
  elementName: QName;

  /**
   * The target template name to call on match.
   */
  targetTemplate: string;
}

/**
 * Represents a property match inside a template.
 */
export class XmlMatch {
  /**
   * The name of the property in XML.
   */
  propertyName: QName;

  /**
   * The IRI of the RDF property.
   */
  propertyIri: string;

  /**
   * True if the property is reverse, i.e. from object to subject.
   */
  isReverse: boolean;

  /**
   * The RDF/XML name of the property, based on its IRI, for lifting.
   */
  interpretation: QName;
}

/**
 * Represents a match created from a datatype property.
 */
export class XmlLiteralMatch extends XmlMatch {
  /**
   * The IRI of the datatype.
   */
  dataTypeIri: string;
}

/**
 * Represents a match created from a class property.
 */
export class XmlClassMatch extends XmlMatch {
  /**
   * True if the property is dematerialized.
   */
  isDematerialized: boolean;

  /**
   * The array of target templates for each class in the range of the property.
   */
  targetTemplates: XmlClassTargetTemplate[];
}

/**
 * Stores information about the class in the range of a property.
 */
export class XmlClassTargetTemplate {
  /**
   * The name of the type of the property in XML, used in xsi:type.
   */
  typeName: QName;

  /**
   * The name of the template corresponding to this class.
   */
  templateName: string;
  
  /**
   * The IRI of the RDF class.
   */
  classIri: string;
}

/**
 * Represents a match created from a class property.
 */
export class XmlCodelistMatch extends XmlMatch {
  isCodelist: true;
}

export function xmlMatchIsLiteral(
  match: XmlMatch
): match is XmlLiteralMatch {
  return (match as XmlLiteralMatch).dataTypeIri !== undefined;
}

export function xmlMatchIsClass(
  match: XmlMatch
): match is XmlClassMatch {
  return (match as XmlClassMatch).targetTemplates !== undefined;
}

export function xmlMatchIsCodelist(
  match: XmlMatch
): match is XmlCodelistMatch {
  return (match as XmlCodelistMatch).isCodelist === true;
}
