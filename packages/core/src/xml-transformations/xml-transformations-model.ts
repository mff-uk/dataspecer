export type QName = [prefix: string, localName: string];

export class XmlTransformation {
  targetNamespace: string | null;
  targetNamespacePrefix: string | null;
  rdfNamespaces: Record<string, string>;
  rootTemplates: XmlRootTemplate[];
  templates: XmlTemplate[];
}

export class XmlTemplate {
  name: string;
  propertyMatches: XmlMatch[];
}

export class XmlRootTemplate {
  typeIri: string;
  elementName: QName;
  targetTemplate: string;
}

export class XmlMatch {
  propertyName: QName;
  propertyIri: string;
  interpretation: QName;
}

export class XmlLiteralMatch extends XmlMatch {
  dataTypeIri: string;
}

export class XmlClassMatch extends XmlMatch {
  isDematerialized: boolean;
  targetTemplate: string;
}

export function xmlMatchIsLiteral(
  match: XmlMatch
): match is XmlLiteralMatch {
  return (match as XmlLiteralMatch).dataTypeIri !== undefined;
}

export function xmlMatchIsClass(
  match: XmlMatch
): match is XmlClassMatch {
  return (match as XmlClassMatch).targetTemplate !== undefined;
}
