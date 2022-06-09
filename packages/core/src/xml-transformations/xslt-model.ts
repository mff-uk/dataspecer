import { QName } from "../xml/xml-conventions";

export class XmlTransformation {
  targetNamespace: string | null;
  targetNamespacePrefix: string | null;
  rdfNamespaces: Record<string, string>;
  rootTemplates: XmlRootTemplate[];
  templates: XmlTemplate[];
  includes: XmlTransformationInclude[];
}

export class XmlTemplate {
  name: string;
  classIri: string;
  propertyMatches: XmlMatch[];
  imported: boolean;
}

export class XmlRootTemplate {
  typeIri: string;
  elementName: QName;
  targetTemplate: string;
}

export class XmlMatch {
  propertyName: QName;
  propertyIri: string;
  isReverse: boolean;
  interpretation: QName;
}

export class XmlLiteralMatch extends XmlMatch {
  dataTypeIri: string;
}

export class XmlClassMatch extends XmlMatch {
  isDematerialized: boolean;
  targetTemplates: XmlClassTargetTemplate[];
}

export class XmlClassTargetTemplate {
  templateName: string;
  typeName: string;
  typeIri: string;
}

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

export class XmlTransformationInclude {
  locations: Record<string, string>;
}
